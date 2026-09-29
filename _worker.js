/**
 * DailyCalcHubs - Cloudflare Pages Advanced Mode Worker
 * Routes /api/export-pdf and delegates all static asset traffic to env.ASSETS.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Intercept /api/export-pdf
    if (url.pathname === '/api/export-pdf') {
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      };

      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
      }

      const browser = env && (env.MYBROWSER || env.BROWSER);

      // Diagnostic check: GET /api/export-pdf
      if (request.method === 'GET') {
        return new Response(JSON.stringify({
          endpoint: '/api/export-pdf',
          status: 'online',
          runtime: 'Cloudflare Pages Advanced Worker',
          hasBrowserBinding: Boolean(browser),
          envKeys: Object.keys(env || {})
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // POST /api/export-pdf
      if (request.method === 'POST') {
        try {
          const payload = await request.json().catch(() => ({}));
          const reqPath = payload.path || '';
          const inputs = payload.inputs || {};

          // Validate path
          const allowedPathPattern = /^\/(ar\/)?(saudi-salary-calculator|saudi-iqama-calculator|saudi-remittance-calculator|everyday-smart-calculator|travel-booking-calculator|shariah-sip-calculator)\/[a-zA-Z0-9\-_/]+$/;
          if (!allowedPathPattern.test(reqPath) || reqPath.includes('..')) {
            return new Response(JSON.stringify({ error: 'Invalid or unauthorized calculator path' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          if (!browser) {
            return new Response(JSON.stringify({
              error: 'Browser Rendering binding not configured on this host',
              bindings: Object.keys(env || {})
            }), {
              status: 503,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          // If browser binding exists, use quickAction or puppeteer
          const targetUrl = new URL(reqPath, request.url).toString();

          if (typeof browser.quickAction === 'function') {
            const pdfResponse = await browser.quickAction('pdf', {
              url: targetUrl,
              pdfOptions: {
                printBackground: true,
                preferCSSPageSize: true
              }
            });

            const cleanSlug = reqPath.replace(/^\/(ar\/)?/, '').replace(/\/$/, '').replace(/\//g, '_');
            const filename = `DailyCalcHubs_${cleanSlug || 'Calculation'}.pdf`;

            return new Response(pdfResponse.body, {
              status: 200,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`
              }
            });
          }

          // Fallback to @cloudflare/puppeteer
          const puppeteer = await import('@cloudflare/puppeteer');
          const b = await puppeteer.launch(browser);
          const page = await b.newPage();
          await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 15000 });

          // Inject user calculation inputs
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

          await page.evaluate(() => document.fonts.ready);

          const pdfBuffer = await page.pdf({
            printBackground: true,
            preferCSSPageSize: true,
            displayHeaderFooter: false
          });

          await b.close();

          const cleanSlug = reqPath.replace(/^\/(ar\/)?/, '').replace(/\/$/, '').replace(/\//g, '_');
          const filename = `DailyCalcHubs_${cleanSlug || 'Calculation'}.pdf`;

          return new Response(pdfBuffer, {
            status: 200,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${filename}"`
            }
          });

        } catch (err) {
          return new Response(JSON.stringify({
            error: 'Serverless PDF rendering error',
            details: String(err && err.message ? err.message : err)
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
    }

    // 2. Delegate all static assets to env.ASSETS
    return env.ASSETS.fetch(request);
  }
};
