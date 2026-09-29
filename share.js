/**
 * DailyCalcHubs - Calculation Print, Real PDF Generation & WhatsApp Sharing Engine
 * Standardized, zero-dependency utility for all active tool pages.
 */
(function(window) {
  'use strict';

  var isMobile = (function() {
    return window.matchMedia('(max-width: 768px)').matches || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  })();

  /**
   * Helper to clean whitespace and multiple spaces
   */
  function cleanText(txt) {
    return (txt || '').replace(/\s+/g, ' ').trim();
  }

  /**
   * Safe Canonical Calculator URL Extractor
   * Returns clean https://dailycalchubs.com URL strictly for the current calculator.
   * Strips all query strings, analytics, owner/debug params, fragments, and index.html.
   */
  function getCanonicalCalculatorUrl() {
    var canonicalEl = document.querySelector('link[rel="canonical"]');
    var rawUrl = (canonicalEl && canonicalEl.getAttribute('href')) ? canonicalEl.getAttribute('href') : (window.location.origin + window.location.pathname);

    // Enforce production HTTPS origin
    if (!rawUrl || rawUrl.indexOf('http') !== 0 || rawUrl.indexOf('file:') === 0) {
      rawUrl = 'https://dailycalchubs.com' + window.location.pathname;
    } else if (rawUrl.indexOf('dailycalchubs.com') === -1) {
      try {
        var parsed = new URL(rawUrl);
        rawUrl = 'https://dailycalchubs.com' + parsed.pathname;
      } catch (e) {
        rawUrl = 'https://dailycalchubs.com' + window.location.pathname;
      }
    }

    // Strip query parameters
    rawUrl = rawUrl.split('?')[0];
    // Strip fragment hashes
    rawUrl = rawUrl.split('#')[0];
    // Strip trailing index.html so canonical directory format is preserved
    rawUrl = rawUrl.replace(/index\.html$/, '');
    // Ensure ends with /
    if (!rawUrl.endsWith('/')) {
      rawUrl += '/';
    }
    return rawUrl;
  }

  /**
   * Idempotently create or update the print-only canonical footer
   */
  function ensurePrintFooter(url) {
    var footer = document.getElementById('dch-print-footer');
    if (!footer) {
      footer = document.createElement('div');
      footer.id = 'dch-print-footer';
      footer.className = 'dch-print-footer';
      document.body.appendChild(footer);
    }
    var isAr = (document.documentElement.getAttribute('lang') === 'ar' || document.documentElement.lang === 'ar');
    var labelText = isAr ? 'للتحقق / إعادة الحساب:' : 'Verify / Recalculate:';
    footer.innerHTML = '<span class="dch-print-footer-label">' + labelText + '</span> ' +
                       '<a href="' + url + '" class="dch-print-canonical-link" target="_blank" rel="noopener">' +
                       url +
                       '</a>';
    return footer;
  }

  /**
   * Dynamic Responsive Print / Share Button Identity Manager
   * Keeps Desktop strictly aligned with original "Print / Save Summary (PDF)"
   * Keeps Mobile strictly aligned with "Share PDF on WhatsApp"
   */
  function updatePrintButtonLabels() {
    var mobileNow = window.matchMedia('(max-width: 768px)').matches || 
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    var isAr = (document.documentElement.getAttribute('lang') === 'ar' || document.documentElement.lang === 'ar');
    var printBtns = document.querySelectorAll('.btn-action-print');

    for (var i = 0; i < printBtns.length; i++) {
      var btn = printBtns[i];
      if (btn.querySelector('.fa-spinner')) continue;

      var span = btn.querySelector('span');
      if (!span) continue;

      if (mobileNow) {
        span.textContent = isAr ? 'مشاركة تقرير PDF عبر واتساب' : 'Share PDF on WhatsApp';
        btn.setAttribute('aria-label', isAr ? 'مشاركة تقرير PDF عبر واتساب' : 'Share calculation summary PDF on WhatsApp');
        btn.setAttribute('title', isAr ? 'مشاركة تقرير PDF عبر واتساب' : 'Share PDF on WhatsApp');
      } else {
        span.textContent = isAr ? 'طباعة / حفظ الملخص (PDF)' : 'Print / Save Summary (PDF)';
        btn.setAttribute('aria-label', isAr ? 'طباعة أو حفظ الملخص بصيغة PDF' : 'Print or save calculation summary as PDF');
        btn.setAttribute('title', isAr ? 'طباعة / حفظ الملخص (PDF)' : 'Print / Save Summary (PDF)');
      }
    }
  }

  // Pre-mount print footer defensively and initialize responsive labels
  function initPrintFooter() {
    try {
      var url = getCanonicalCalculatorUrl();
      ensurePrintFooter(url);
    } catch (e) {
      // Non-critical
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initPrintFooter();
      updatePrintButtonLabels();
    });
  } else {
    initPrintFooter();
    updatePrintButtonLabels();
  }

  if (window.matchMedia) {
    try {
      var mq = window.matchMedia('(max-width: 768px)');
      if (mq.addEventListener) {
        mq.addEventListener('change', updatePrintButtonLabels);
      } else if (mq.addListener) {
        mq.addListener(updatePrintButtonLabels);
      }
    } catch (e) {}
  }

  /**
   * Extract Active Calculator Input State as Key-Value Pairs
   */
  function extractCalculatorState() {
    var state = {};
    var elements = document.querySelectorAll('input, select, textarea');
    elements.forEach(function(el) {
      if (el.id) {
        if (el.type === 'checkbox' || el.type === 'radio') {
          state[el.id] = el.checked;
        } else {
          state[el.id] = el.value;
        }
      } else if (el.name) {
        if (el.type === 'checkbox' || el.type === 'radio') {
          if (el.checked) state[el.name] = el.value;
        } else {
          state[el.name] = el.value;
        }
      }
    });
    return state;
  }

  /**
   * Action 1: PRINT / SHARE CALCULATION PDF SUMMARY
   * - DESKTOP: Strictly preserves original browser print/save PDF flow (window.print())
   * - MOBILE: Obtains canonical headless Chromium PDF and opens native Web Share sheet with file attached
   */
  window.dchSharePdfWhatsApp = async function(btn) {
    var originalHtml = btn ? btn.innerHTML : '';
    var isAr = (document.documentElement.getAttribute('lang') === 'ar' || document.documentElement.lang === 'ar');
    var mobileNow = window.matchMedia('(max-width: 768px)').matches || 
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // =========================================================================
    // DESKTOP: STRICTLY PRESERVE ORIGINAL OLD BROWSER PRINT / SAVE PDF EXPERIENCE
    // Zero server fetch, zero file download, zero WhatsApp Web opening, zero toasts.
    // =========================================================================
    if (!mobileNow) {
      try {
        var canonicalUrl = getCanonicalCalculatorUrl();
        ensurePrintFooter(canonicalUrl);
        window.print();
      } catch (e) {
        console.error('DailyCalcHubs: Desktop print error', e);
      }
      return;
    }

    // =========================================================================
    // MOBILE: CANONICAL HEADLESS CHROMIUM PDF & NATIVE WEB SHARE
    // Zero fallback to Android "Save as PDF" / Print Spooler.
    // =========================================================================
    try {
      // 1. Identify active calculation container
      var container = btn && btn.closest ? 
        btn.closest('.result-summary-box, .results-panel, .mini-result-box, .calc-card, .calculator-card') : null;

      // 2. Extract Tool Title
      var toolTitle = '';
      var h1El = document.querySelector('.tool-title') || document.querySelector('h1');
      if (h1El) {
        toolTitle = cleanText(h1El.innerText);
      }
      if (!toolTitle && container) {
        var cardTitle = container.closest('.calc-card, .calculator-card, .feature-card');
        if (cardTitle) {
          var titleEl = cardTitle.querySelector('.calc-card-title, .card-main-title, h2, h3');
          if (titleEl) toolTitle = cleanText(titleEl.innerText);
        }
      }
      if (!toolTitle) {
        toolTitle = cleanText(document.title.split(/[\u2014\u2013\-\|]/)[0]);
      }

      // 3. Extract Primary Result Value & Validation
      var primaryVal = '';
      if (container) {
        var bigValEl = container.querySelector('.result-big-val, .total-amount-display, .mini-result-val, .big-amount');
        if (bigValEl) primaryVal = cleanText(bigValEl.innerText);
      }
      if (!primaryVal) {
        var fallbackIds = [
          'takeHomeDisplay', 'inrAmount', 'bdtAmount', 'pkrAmount', 'phpAmount', 'lkrAmount', 'nprAmount',
          'resEosbTotal', 'resNetSettlement', 'resAnnualTakeHome', 'resGrandTotal', 'resCost12Total',
          'resTotalDepFee', 'resPerPersonShare', 'resBmiVal', 'resTotalFuelCost', 'resPeriodCost',
          'resTotalWealth', 'totalCheckoutAmount', 'resTotalBudget', 'resFinalPrice', 'resDailyWage',
          'resHourlyRate', 'resTotalOtPay', 'resNewNet', 'thNetDisplay', 'resNominalCorpus', 'resGoalMonthly'
        ];
        for (var f = 0; f < fallbackIds.length; f++) {
          var el = document.getElementById(fallbackIds[f]);
          if (el && el.innerText && el.innerText.trim() !== '') {
            primaryVal = cleanText(el.innerText);
            break;
          }
        }
      }

      if (!primaryVal || primaryVal === '--' || (primaryVal === '0.00 SAR' && !container)) {
        alert(isAr ? 'يرجى إجراء الحساب أولاً لإنشاء تقرير PDF الخاص بك.' : 'Please perform a calculation first to generate your PDF report.');
        return;
      }

      // 4. Set Loading State on Button
      if (btn) {
        btn.disabled = true;
        btn.style.opacity = '0.75';
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>' + (isAr ? 'جاري تجهيز تقرير PDF...' : 'Generating PDF Report...') + '</span>';
      }

      // 5. Build Filename & Canonical Link
      var canonicalUrl = getCanonicalCalculatorUrl();
      var currentPath = window.location.pathname;
      var dateSlug = new Date().toISOString().slice(0, 10);
      var toolSlug = currentPath.replace(/^\/(ar\/)?/, '').replace(/\/$/, '').replace(/\//g, '_') || 'Calculation';
      var fileName = 'DailyCalcHubs_' + toolSlug + '_' + dateSlug + '.pdf';

      // 6. Fetch Canonical Headless Chromium PDF from Serverless Endpoint
      var inputsState = extractCalculatorState();
      var response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: currentPath,
          inputs: inputsState
        })
      });

      if (!response.ok) {
        var errJson = await response.json().catch(function() { return {}; });
        var errMsg = errJson.error || ('HTTP ' + response.status);
        console.error('DailyCalcHubs: Serverless PDF export failed:', errMsg);
        alert(isAr ? 'تعذر إنشاء تقرير PDF حالياً من الخادم. يرجى المحاولة مرة أخرى.' : 'Unable to generate canonical PDF report at this time. Please try again.');
        return;
      }

      var pdfBlob = await response.blob();
      if (!pdfBlob || pdfBlob.size < 500) {
        alert(isAr ? 'الملف الناتج غير صالح. يرجى المحاولة مرة أخرى.' : 'Invalid PDF generated. Please try again.');
        return;
      }

      // 7. Dispatch Real PDF File via Native Web Share API
      var shareText = (isAr ? 'تقرير حساب من DailyCalcHubs: ' : 'DailyCalcHubs Calculation Report: ') + toolTitle +
                      '\n' + (isAr ? 'للتحقق وإعادة الحساب: ' : 'Verify / Recalculate: ') + canonicalUrl;

      if (navigator.canShare && typeof File !== 'undefined') {
        try {
          var pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
          if (navigator.canShare({ files: [pdfFile] })) {
            await navigator.share({
              files: [pdfFile],
              title: toolTitle,
              text: shareText
            });
            return;
          }
        } catch (shareErr) {
          if (shareErr.name === 'AbortError') {
            return; // Clean user cancel without doing anything
          }
        }
      }

      // If Web Share API Level 2 file sharing is not supported by the browser, download directly:
      var blobUrl = URL.createObjectURL(pdfBlob);
      var a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function() { URL.revokeObjectURL(blobUrl); }, 2000);
      alert(isAr ? 'تم تنزيل تقرير PDF بنجاح على جهازك لمشاركته مباشرة عبر واتساب.' : 'PDF report downloaded successfully to your device for direct sharing on WhatsApp.');

    } catch (err) {
      console.error('DailyCalcHubs: PDF Share error', err);
      alert(isAr ? 'حدث خطأ أثناء إنشاء التقرير. يرجى المحاولة مجدداً.' : 'An error occurred while generating the report. Please try again.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.innerHTML = originalHtml;
      }
      updatePrintButtonLabels();
    }
  };

  // Alias dchPrintSummary to dchSharePdfWhatsApp for full backwards compatibility
  window.dchPrintSummary = window.dchSharePdfWhatsApp;

  /**
   * Action 2: SHARE ON WHATSAPP (Text-Only Standard WhatsApp Share)
   * 100% PRESERVED & UNCHANGED.
   */
  window.dchShareWhatsApp = function(btn) {
    try {
      // 1. Identify active calculation container
      var container = btn && btn.closest ? 
        btn.closest('.result-summary-box, .results-panel, .mini-result-box, .calc-card, .calculator-card') : null;

      // 2. Extract Tool Title
      var toolTitle = '';
      var h1El = document.querySelector('.tool-title') || document.querySelector('h1');
      if (h1El) {
        toolTitle = cleanText(h1El.innerText);
      }
      if (!toolTitle && container) {
        var cardTitle = container.closest('.calc-card, .calculator-card, .feature-card');
        if (cardTitle) {
          var titleEl = cardTitle.querySelector('.calc-card-title, .card-main-title, h2, h3');
          if (titleEl) toolTitle = cleanText(titleEl.innerText);
        }
      }
      if (!toolTitle) {
        toolTitle = cleanText(document.title.split(/[\u2014\u2013\-\|]/)[0]);
      }

      // 3. Extract Primary Result Value & Label
      var primaryVal = '';
      var primaryLabel = '';

      if (container) {
        var bigValEl = container.querySelector('.result-big-val, .total-amount-display, .mini-result-val, .big-amount');
        if (bigValEl) {
          primaryVal = cleanText(bigValEl.innerText);
        }
        var labelEl = container.querySelector('.result-label, .result-header .result-badge, .mini-result-label');
        if (labelEl) {
          primaryLabel = cleanText(labelEl.innerText);
        }
      }

      // Fallbacks if container query didn't capture (e.g. standalone element IDs)
      if (!primaryVal) {
        var fallbackIds = [
          'takeHomeDisplay', 'inrAmount', 'bdtAmount', 'pkrAmount', 'phpAmount', 'lkrAmount', 'nprAmount',
          'resEosbTotal', 'resNetSettlement', 'resAnnualTakeHome', 'resGrandTotal', 'resCost12Total',
          'resTotalDepFee', 'resPerPersonShare', 'resBmiVal', 'resTotalFuelCost', 'resPeriodCost',
          'resTotalWealth', 'totalCheckoutAmount', 'resTotalBudget', 'resFinalPrice', 'resDailyWage',
          'resHourlyRate', 'resTotalOtPay', 'resNewNet', 'thNetDisplay', 'resNominalCorpus', 'resGoalMonthly'
        ];
        for (var i = 0; i < fallbackIds.length; i++) {
          var el = document.getElementById(fallbackIds[i]);
          if (el && el.innerText && el.innerText.trim() !== '') {
            primaryVal = cleanText(el.innerText);
            break;
          }
        }
      }

      var isAr = (document.documentElement.getAttribute('lang') === 'ar' || document.documentElement.lang === 'ar');

      // Validation: If no valid calculation output exists yet, warn user
      if (!primaryVal || primaryVal === '--' || (primaryVal === '0.00 SAR' && !container)) {
        alert(isAr ? 'يرجى إجراء الحساب أولاً لإنشاء الملخص الخاص بك.' : 'Please perform a calculation first to generate your summary.');
        return;
      }

      // 4. Extract Secondary Metadata / Breakdown Details
      var details = [];

      if (container) {
        // A. Check for Rate / Status tag (e.g. "100% Full Entitlement", "Normal Weight")
        var rateTag = container.querySelector('.result-rate-tag, .badge-status, #resCategoryText, #resCategoryBadge');
        if (rateTag) {
          var tagTxt = cleanText(rateTag.innerText);
          if (tagTxt) details.push((isAr ? 'الحالة: ' : 'Status: ') + tagTxt);
        }

        // B. Check for Meta Boxes (.meta-box-inner / .stat-pill)
        var metaItems = container.querySelectorAll('.meta-box-inner, .stat-pill');
        for (var m = 0; m < metaItems.length && details.length < 4; m++) {
          var item = metaItems[m];
          var tEl = item.querySelector('.meta-box-title, .stat-label');
          var vEl = item.querySelector('.meta-box-val, .stat-val');
          if (tEl && vEl) {
            var t = cleanText(tEl.innerText);
            var v = cleanText(vEl.innerText);
            if (t && v) details.push(t + ': ' + v);
          }
        }

        // C. Check for Mini Sub-Stats
        if (details.length === 0) {
          var subStatRows = container.querySelectorAll('.mini-sub-stat-row');
          for (var s = 0; s < subStatRows.length && details.length < 3; s++) {
            var rowTxt = cleanText(subStatRows[s].innerText);
            if (rowTxt) details.push(rowTxt);
          }
        }

        // D. Check for Breakdown Table Rows (e.g. Travel Booking)
        if (details.length === 0) {
          var tableRows = container.querySelectorAll('.breakdown-table tr');
          for (var r = 0; r < tableRows.length && details.length < 3; r++) {
            var cells = tableRows[r].querySelectorAll('td');
            if (cells.length >= 2) {
              var rowLabel = cleanText(cells[0].innerText);
              var rowVal = cleanText(cells[1].innerText);
              if (rowLabel && rowVal && !tableRows[r].classList.contains('highlight-row')) {
                details.push(rowLabel + ': ' + rowVal);
              }
            }
          }
        }
      }

      // 5. Build Safe Canonical Link (Strictly strip query params & tracking)
      var cleanUrl = window.location.origin + window.location.pathname;

      // 6. Assemble WhatsApp Markdown Message
      var lines = [];
      lines.push(isAr ? '*ملخص حساب DailyCalcHubs*' : '*DailyCalcHubs Calculation Summary*');
      lines.push((isAr ? 'الأداة: ' : 'Tool: ') + toolTitle);
      
      if (primaryLabel) {
        lines.push('*' + primaryLabel + ':* ' + primaryVal);
      } else {
        lines.push((isAr ? '*النتيجة:* ' : '*Result:* ') + primaryVal);
      }

      if (details.length > 0) {
        lines.push('');
        lines.push(isAr ? '*التفاصيل:*' : '*Breakdown:*');
        for (var d = 0; d < details.length; d++) {
          lines.push('- ' + details[d]);
        }
      }

      lines.push('');
      lines.push(isAr ? 'للحساب أو التحقق عبر الرابط:' : 'Calculate or verify here:');
      lines.push(cleanUrl);

      var messageText = lines.join('\n');

      // 7. Dispatch to WhatsApp
      var waUrl = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(messageText);
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('DailyCalcHubs: WhatsApp share error', err);
    }
  };

})(window);
