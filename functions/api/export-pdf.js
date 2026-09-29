/**
 * DailyCalcHubs - Cloudflare Pages Serverless Function
 * Route: POST /api/export-pdf
 * Renders the exact calculator page with active user inputs using Cloudflare Browser Rendering.
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  // Security: Handle CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  try {
    const payload = await request.json();
    const reqPath = payload.path || '';
    const inputs = payload.inputs || {};

    // 1. SSRF & Security Validation: Restrict to allowed DailyCalcHubs calculator paths
    const allowedPathPattern = /^\/(ar\/)?(saudi-salary-calculator|saudi-iqama-calculator|saudi-remittance-calculator|everyday-smart-calculator|travel-booking-calculator|shariah-sip-calculator)\/[a-zA-Z0-9\-_/]+$/;
    
    if (!allowedPathPattern.test(reqPath) || reqPath.includes('..')) {
      return new Response(JSON.stringify({ error: 'Invalid or unauthorized calculator path' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 2. Fallback check for Cloudflare Browser Rendering binding
    if (!env || !env.MYBROWSER) {
      return new Response(JSON.stringify({ error: 'Serverless browser rendering service not configured on this host' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 3. Launch Headless Browser via @cloudflare/puppeteer
    const puppeteer = await import('@cloudflare/puppeteer');
    const browser = await puppeteer.launch(env.MYBROWSER);
    const page = await browser.newPage();

    // Resolve URL on current origin
    const targetUrl = new URL(reqPath, request.url).toString();
    await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 15000 });

    // 4. Inject User Calculation State & Hide Cookies
    await page.evaluate((inputsObj) => {
      const cb = document.querySelector('.cookie-consent-banner') || document.getElementById('cookieConsentBanner');
      if (cb) cb.style.display = 'none';

      for (const [id, val] of Object.entries(inputsObj)) {
        const el = document.getElementById(id) || document.querySelector('[name="' + id + '"]');
        if (el) {
          if (el.type === 'checkbox' || el.type === 'radio') {
            el.checked = !!val;
          } else {
            el.value = val;
          }
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }

      if (typeof initPrintFooter === 'function') initPrintFooter();
    }, inputs);

    // Wait for fonts & rendering
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 400));

    // 5. Generate PDF with Native Print CSS
    const pdfBuffer = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false
    });

    await browser.close();

    // Clean filename
    const cleanSlug = reqPath.replace(/^\/(ar\/)?/, '').replace(/\/$/, '').replace(/\//g, '_');
    const filename = `DailyCalcHubs_${cleanSlug || 'Calculation'}.pdf`;

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'PDF generation failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
