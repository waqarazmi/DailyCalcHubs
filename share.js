/**
 * DailyCalcHubs - Calculation Print, Real PDF Generation & WhatsApp Sharing Engine
 * Standardized, zero-dependency utility for all active tool pages.
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

  // Pre-mount print footer defensively so browser shortcuts (Ctrl+P / Cmd+P) also carry the canonical link
  function initPrintFooter() {
    try {
      var url = getCanonicalCalculatorUrl();
      ensurePrintFooter(url);
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
   * Universal Toast Notification for Download / Share Feedback
   */
  function showToast(message, isAr) {
    var existing = document.getElementById('dch-share-toast');
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }

    var toast = document.createElement('div');
    toast.id = 'dch-share-toast';
    toast.style.cssText = [
      'position: fixed',
      'bottom: 24px',
      'left: 50%',
      'transform: translateX(-50%)',
      'background: #0f172a',
      'color: #ffffff',
      'padding: 12px 20px',
      'border-radius: 10px',
      'box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      'font-family: inherit',
      'font-size: 14px',
      'font-weight: 600',
      'z-index: 999999',
      'display: flex',
      'align-items: center',
      'gap: 10px',
      'max-width: 90vw',
      'width: max-content',
      'direction: ' + (isAr ? 'rtl' : 'ltr'),
      'transition: opacity 0.3s ease, transform 0.3s ease',
      'opacity: 0'
    ].join(';');

    var iconHtml = '<i class="fas fa-file-pdf" style="color:#38bdf8; font-size:16px;"></i>';
    toast.innerHTML = iconHtml + '<span>' + message + '</span>';
    document.body.appendChild(toast);

    // Animate in
    setTimeout(function() {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);

    // Auto dismiss after 4.5 seconds
    setTimeout(function() {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(10px)';
      setTimeout(function() {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 350);
    }, 4500);
  }

  /**
   * Browser File Download Trigger
   */
  function triggerDownload(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
  }

  /**
   * Extract Active Calculator Input State from Current Page
   * Captures all user-entered inputs, sliders, select dropdowns, and checkboxes.
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
   * Fallback for Desktops & Non-File-Share Browsers:
   * 1. Saves/Downloads genuine PDF file directly to device
   * 2. Opens WhatsApp Web with calculation summary & direct verification link
   * 3. Displays user-friendly notification
   */
  function fallbackDesktopShare(pdfBlob, fileName, shareText, isAr) {
    // 1. Download genuine PDF file locally
    triggerDownload(pdfBlob, fileName);

    // 2. Open WhatsApp Web / App with structured summary
    var waUrl = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(shareText);
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    // 3. User feedback toast
    var toastMsg = isAr ?
      'تم تنزيل تقرير PDF الكامل! يمكنك الآن إرفاق الملف في محادثة واتساب.' :
      'Full PDF report downloaded! You can now attach the file to your WhatsApp chat.';
    showToast(toastMsg, isAr);
  }

  /**
   * Action 1: SHARE PDF ON WHATSAPP (Server-Side Native Multi-Page Headless PDF Engine)
   * 1. Preserves the complete old print-style PDF with 100% fidelity.
   * 2. Dynamically counts pages (1, 2, 3, 5, etc.) based on content length.
   * 3. Preserves all clickable hyperlinks (canonical recalculate links, provider links).
   * 4. Shares PDF directly on mobile via Web Share API v2 (navigator.share).
   * 5. Downloads genuine PDF & launches WhatsApp Web on desktop with toast guide.
   */
  window.dchSharePdfWhatsApp = async function(btn) {
    var originalHtml = btn ? btn.innerHTML : '';
    var isAr = (document.documentElement.getAttribute('lang') === 'ar' || document.documentElement.lang === 'ar');

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
        for (var i = 0; i < fallbackIds.length; i++) {
          var el = document.getElementById(fallbackIds[i]);
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

      // 5. Gather Active Calculation State
      var inputsState = extractCalculatorState();
      var canonicalUrl = getCanonicalCalculatorUrl();
      var currentPath = window.location.pathname;

      // 6. Request Server-Side Headless Chromium PDF Generation
      var pdfBlob = null;
      try {
        var response = await fetch('/api/export-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: currentPath,
            inputs: inputsState
          })
        });

        if (response.ok && response.headers.get('content-type') && response.headers.get('content-type').indexOf('application/pdf') !== -1) {
          pdfBlob = await response.blob();
        }
      } catch (netErr) {
        console.warn('DailyCalcHubs: Serverless PDF endpoint unavailable, using native print fallback', netErr);
      }

      // 7. If Server PDF was generated successfully:
      if (pdfBlob && pdfBlob.size > 1000) {
        var dateSlug = new Date().toISOString().slice(0, 10);
        var toolSlug = currentPath.replace(/^\/(ar\/)?/, '').replace(/\/$/, '').replace(/\//g, '_') || 'Calculation';
        var fileName = 'DailyCalcHubs_' + toolSlug + '_' + dateSlug + '.pdf';

        var shareText = (isAr ? 'تقرير حساب من DailyCalcHubs: ' : 'DailyCalcHubs Calculation Report: ') + toolTitle +
                        '\n' + (isAr ? 'للتحقق وإعادة الحساب: ' : 'Verify / Recalculate: ') + canonicalUrl;

        // Check for Web Share API v2 with file support (Mobile Chrome / Safari)
        var fileShared = false;
        if (navigator.canShare && typeof File !== 'undefined') {
          try {
            var pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
            if (navigator.canShare({ files: [pdfFile] })) {
              await navigator.share({
                files: [pdfFile],
                title: toolTitle,
                text: shareText
              });
              fileShared = true;
            }
          } catch (shareErr) {
            if (shareErr.name === 'AbortError') {
              return; // Clean user cancel
            }
          }
        }

        // Desktop & Unsupported Fallback:
        if (!fileShared) {
          fallbackDesktopShare(pdfBlob, fileName, shareText, isAr);
        }
      } else {
        // Fallback: If server is offline or static preview, open native print dialog with existing @media print CSS
        ensurePrintFooter(canonicalUrl);
        window.print();
      }

    } catch (err) {
      console.error('DailyCalcHubs: PDF Share error', err);
      try {
        var fbUrl = getCanonicalCalculatorUrl();
        ensurePrintFooter(fbUrl);
        window.print();
      } catch (e) {}
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.innerHTML = originalHtml;
      }
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
