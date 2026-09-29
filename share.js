/**
 * DailyCalcHubs - Calculation Print, Real PDF & WhatsApp Sharing Engine
 * Standardized, zero-dependency, 100% client-side utility for all active tool pages.
 */
(function(window) {
  'use strict';

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
   * Universal Print Button Label Initializer
   * Sets authentic, clear labels:
   * EN: Print / Save Summary (PDF)
   * AR: طباعة / حفظ الملخص (PDF)
   */
  function updatePrintButtonLabels() {
    var isAr = (document.documentElement.getAttribute('lang') === 'ar' || document.documentElement.lang === 'ar');
    var printBtns = document.querySelectorAll('.btn-action-print');

    for (var i = 0; i < printBtns.length; i++) {
      var btn = printBtns[i];
      var span = btn.querySelector('span');
      if (span) {
        span.textContent = isAr ? 'طباعة / حفظ الملخص (PDF)' : 'Print / Save Summary (PDF)';
      }
      btn.setAttribute('aria-label', isAr ? 'طباعة أو حفظ الملخص بصيغة PDF' : 'Print or save calculation summary as PDF');
      btn.setAttribute('title', isAr ? 'طباعة / حفظ الملخص (PDF)' : 'Print / Save Summary (PDF)');
    }
  }

  /**
   * Action 1: Universal Clean Print / Save Summary as PDF
   * Uses browser-native high-definition vector printing with zero external libraries or servers.
   * Inserts the active clickable canonical link repeated on printed pages.
   * 100% faithful to the actual calculator DOM on every page (EN and AR).
   */
  window.dchPrintSummary = function(btn) {
    try {
      var canonicalUrl = getCanonicalCalculatorUrl();
      ensurePrintFooter(canonicalUrl);
      window.print();
    } catch (e) {
      console.error('DailyCalcHubs: Print error', e);
    }
  };

  // Full backwards-compatibility alias in case any element has onclick="dchSharePdfWhatsApp(this)"
  window.dchSharePdfWhatsApp = window.dchPrintSummary;

  // Pre-mount print footer defensively and initialize labels
  function initPrintFooter() {
    try {
      var url = getCanonicalCalculatorUrl();
      ensurePrintFooter(url);
      updatePrintButtonLabels();
    } catch (e) {
      // Non-critical
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPrintFooter);
  } else {
    initPrintFooter();
  }

  /**
   * Action 2: Share Calculation Summary on WhatsApp
   * Dynamically constructs a clean, privacy-safe message from active calculation output.
   * 100% UNTOUCHED & PRESERVED.
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
