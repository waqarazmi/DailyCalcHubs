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
   * Client-Side PDF Generation Engine Loader
   * Dynamically loads html2pdf.bundle.min.js locally or via CDN.
   */
  var html2pdfPromise = null;
  function loadHtml2Pdf() {
    if (window.html2pdf) return Promise.resolve(window.html2pdf);
    if (html2pdfPromise) return html2pdfPromise;

    html2pdfPromise = new Promise(function(resolve, reject) {
      var script = document.createElement('script');
      script.src = '/assets/html2pdf.bundle.min.js';
      script.onload = function() {
        if (window.html2pdf) {
          resolve(window.html2pdf);
        } else {
          loadCdnFallback(resolve, reject);
        }
      };
      script.onerror = function() {
        loadCdnFallback(resolve, reject);
      };
      document.head.appendChild(script);
    });

    return html2pdfPromise;
  }

  function loadCdnFallback(resolve, reject) {
    var cdnScript = document.createElement('script');
    cdnScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    cdnScript.onload = function() {
      if (window.html2pdf) resolve(window.html2pdf);
      else reject(new Error('html2pdf not found'));
    };
    cdnScript.onerror = function(err) {
      reject(err);
    };
    document.head.appendChild(cdnScript);
  }

  // Preload html2pdf on mobile devices during idle time for instant click responsiveness
  if (isMobile) {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(function() { loadHtml2Pdf().catch(function(){}); });
    } else {
      setTimeout(function() { loadHtml2Pdf().catch(function(){}); }, 2500);
    }
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
   * Extract Form Input Labels & Formatted Values for PDF Page 1 Summary
   */
  function extractUserInputsList() {
    var list = [];
    var elements = document.querySelectorAll('input:not([type="hidden"]), select');
    elements.forEach(function(el) {
      if (el.closest('.cookie-consent-banner, #searchModal, .search-modal, header, footer, .dch-print-footer')) return;
      var val = '';
      if (el.type === 'checkbox' || el.type === 'radio') {
        if (!el.checked) return;
        val = el.value || 'Yes';
      } else if (el.tagName === 'SELECT') {
        var opt = el.options[el.selectedIndex];
        val = opt ? opt.text : el.value;
      } else {
        val = el.value;
      }
      if (!val || val === '--') return;

      var label = '';
      if (el.id) {
        var lEl = document.querySelector('label[for="' + el.id + '"]');
        if (lEl) label = cleanText(lEl.innerText);
      }
      if (!label && el.closest('.input-group, .form-group, .calc-field')) {
        var fLabel = el.closest('.input-group, .form-group, .calc-field').querySelector('.input-label, label, .field-label');
        if (fLabel) label = cleanText(fLabel.innerText);
      }
      if (!label) {
        label = el.getAttribute('placeholder') || el.name || el.id;
      }
      if (label && val) {
        list.push({ label: label.replace(/[:：]$/, ''), value: val });
      }
    });
    return list;
  }

  /**
   * Helper to trigger direct PDF download without opening print spooler
   */
  function downloadPdfBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function() { URL.revokeObjectURL(url); }, 2000);
  }

  /**
   * Client-Side PDF Generation Engine
   * Constructs the authentic 3-page printable report with DailyCalcHubs branding,
   * active user inputs, calculation results, comparison table, and canonical verification link.
   */
  async function generateClientPdfBlob(opts) {
    await loadHtml2Pdf();

    var isAr = opts.isAr;
    var toolTitle = opts.toolTitle;
    var toolLead = opts.toolLead;
    var canonicalUrl = opts.canonicalUrl;
    var container = opts.container;
    var inputs = opts.inputs || [];

    // Create off-screen rendering root formatted for A4 portrait (794px at 96 DPI)
    var root = document.createElement('div');
    root.id = 'dch-pdf-render-root';
    root.setAttribute('dir', isAr ? 'rtl' : 'ltr');
    root.setAttribute('lang', isAr ? 'ar' : 'en');
    root.style.cssText = 'position:fixed; left:-9999px; top:0; width:794px; background:#ffffff; color:#0f172a; ' +
      'font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Cairo", "Tajawal", Helvetica, Arial, sans-serif; ' +
      'padding:26px 32px; box-sizing:border-box; font-size:12px; line-height:1.45;';

    // 1. BRANDING HEADER
    var todayStr = new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    var headerHtml = '<div style="border-bottom:2px solid #0284c7; padding-bottom:8px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:flex-end;">' +
      '<div>' +
        '<div style="font-size:22px; font-weight:800; color:#0284c7; letter-spacing:-0.5px;">DailyCalcHubs</div>' +
        '<div style="font-size:11px; color:#64748b;">' + (isAr ? 'حاسبات مالية ويومية موثوقة في المملكة العربية السعودية' : 'Trusted Financial & Everyday Calculators for Saudi Arabia') + '</div>' +
      '</div>' +
      '<div style="font-size:10.5px; color:#94a3b8; text-align:' + (isAr ? 'left' : 'right') + ';">' + todayStr + '</div>' +
    '</div>';

    // 2. TOOL HERO
    var heroHtml = '<div style="margin-bottom:14px; padding-bottom:10px; border-bottom:1px solid #e2e8f0;">' +
      '<h1 style="font-size:18px; font-weight:700; color:#0f172a; margin:0 0 4px 0;">' + toolTitle + '</h1>' +
      (toolLead ? '<p style="font-size:11px; color:#475569; margin:0;">' + toolLead + '</p>' : '') +
    '</div>';

    // 3. INPUTS SUMMARY
    var inputsListHtml = '';
    if (inputs.length > 0) {
      inputsListHtml = '<div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:10px 14px; margin-bottom:14px;">' +
        '<div style="font-size:10.5px; font-weight:700; color:#334155; text-transform:uppercase; margin-bottom:6px;">' +
          (isAr ? 'بيانات الحساب المدخلة' : 'CALCULATION INPUT PARAMETERS') +
        '</div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:6px 16px; font-size:11px;">';
      for (var i = 0; i < inputs.length; i++) {
        inputsListHtml += '<div><span style="color:#64748b;">' + inputs[i].label + ': </span>' +
          '<strong style="color:#0f172a;">' + inputs[i].value + '</strong></div>';
      }
      inputsListHtml += '</div></div>';
    }

    // 4. RESULTS PANEL CLONE
    var resultClone = null;
    if (container) {
      resultClone = container.cloneNode(true);
      var buttons = resultClone.querySelectorAll('.calc-action-bar, button, .action-buttons');
      buttons.forEach(function(b) { b.remove(); });
      resultClone.style.cssText = 'background:#f0fdf4 !important; border:1.5px solid #0284c7 !important; border-radius:8px !important; padding:16px !important; margin-bottom:14px !important; color:#0f172a !important;';
      var bigVals = resultClone.querySelectorAll('.result-big-val, .total-amount-display, .mini-result-val, .big-amount');
      bigVals.forEach(function(v) {
        v.style.cssText = 'color:#0284c7 !important; font-size:24px !important; font-weight:800 !important;';
      });
    }

    // Page 1 Container
    var page1 = document.createElement('div');
    page1.className = 'dch-pdf-page-1';
    page1.innerHTML = headerHtml + heroHtml + inputsListHtml;
    if (resultClone) page1.appendChild(resultClone);
    root.appendChild(page1);

    // 5. PAGE 2: COMPARISON TABLE OR DETAILED BREAKDOWN
    var tableEl = document.querySelector('.provider-table-card table, table.provider-table, table.comparison-table, table.worked-example-table, .data-table-cards, .breakdown-table');
    if (tableEl) {
      var page2 = document.createElement('div');
      page2.className = 'dch-pdf-page-2';
      page2.style.cssText = 'page-break-before:always; break-before:page; padding-top:10px;';

      var tableTitle = '';
      var cardTitle = tableEl.closest('.provider-table-card, .calc-card, .worked-example-card');
      if (cardTitle) {
        var tEl = cardTitle.querySelector('.provider-table-title, h2, h3');
        if (tEl) tableTitle = cleanText(tEl.innerText);
      }
      if (!tableTitle) {
        tableTitle = isAr ? 'جدول المقارنة والتفاصيل' : 'Detailed Breakdown & Comparison';
      }

      var tableClone = tableEl.cloneNode(true);
      tableClone.style.cssText = 'display:table !important; width:100% !important; border-collapse:collapse !important; font-size:10pt !important; margin-top:10px !important;';
      
      var ths = tableClone.querySelectorAll('th');
      ths.forEach(function(th) {
        th.style.cssText = 'display:table-cell !important; background:#f1f5f9 !important; border:1px solid #cbd5e1 !important; padding:7px 10px !important; font-weight:700 !important; color:#0f172a !important; text-align:' + (isAr ? 'right' : 'left') + ' !important;';
      });

      var trs = tableClone.querySelectorAll('tr');
      trs.forEach(function(tr) {
        tr.style.cssText = 'display:table-row !important; background:transparent !important; border:none !important; padding:0 !important;';
      });

      var tds = tableClone.querySelectorAll('td');
      tds.forEach(function(td) {
        td.style.cssText = 'display:table-cell !important; border:1px solid #e2e8f0 !important; padding:7px 10px !important; color:#0f172a !important; background:#ffffff !important; vertical-align:middle !important;';
      });

      // Hide 6th column if it has 'Send Money' action button
      var headers = tableClone.querySelectorAll('thead th');
      if (headers.length >= 6) {
        var lastTh = headers[headers.length - 1];
        if (/send|action|تحويل/i.test(lastTh.innerText)) {
          lastTh.remove();
          tableClone.querySelectorAll('tbody tr').forEach(function(r) {
            var rCells = r.querySelectorAll('td');
            if (rCells.length >= headers.length) {
              rCells[rCells.length - 1].remove();
            }
          });
        }
      }

      page2.innerHTML = '<div style="border-bottom:1.5px solid #e2e8f0; padding-bottom:6px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">' +
        '<h2 style="font-size:14px; font-weight:700; color:#0f172a; margin:0;">' + tableTitle + '</h2>' +
        '<span style="font-size:10.5px; color:#64748b;">DailyCalcHubs Official Benchmark</span>' +
      '</div>';
      page2.appendChild(tableClone);
      root.appendChild(page2);
    }

    // 6. PAGE 3: OFFICIAL GUIDELINES, REGULATORY ASSURANCE & CANONICAL FOOTER
    var page3 = document.createElement('div');
    page3.className = 'dch-pdf-page-3';
    page3.style.cssText = 'page-break-before:always; break-before:page; padding-top:10px; display:flex; flex-direction:column; min-height:850px; justify-content:space-between;';

    // Extract rules if present
    var rulesList = document.querySelector('.rules-list, .sidebar-info-card ul');
    var rulesHtml = '';
    if (rulesList) {
      var items = rulesList.querySelectorAll('li');
      for (var r = 0; r < items.length && r < 5; r++) {
        var txt = cleanText(items[r].innerText);
        if (txt) {
          rulesHtml += '<div style="display:flex; gap:8px; margin-bottom:8px;">' +
            '<span style="color:#16a34a; font-weight:700;">✓</span>' +
            '<div>' + txt + '</div>' +
          '</div>';
        }
      }
    }

    if (!rulesHtml) {
      rulesHtml = '<div style="display:flex; gap:8px; margin-bottom:8px;">' +
        '<span style="color:#16a34a; font-weight:700;">✓</span>' +
        '<div><strong>' + (isAr ? 'ضريبة القيمة المضافة 15% (ZATCA): ' : 'ZATCA 15% VAT: ') + '</strong>' +
        (isAr ? 'تُطبق الضريبة فقط على رسوم الخدمة أو عمولة التحويل، ولا تُطبق مطلقاً على المبلغ المحول أو أصل الراتب.' : 'VAT applies solely to service charges and transfer fees, never to base capital or principal salary.') + '</div>' +
      '</div>' +
      '<div style="display:flex; gap:8px; margin-bottom:8px;">' +
        '<span style="color:#16a34a; font-weight:700;">✓</span>' +
        '<div><strong>' + (isAr ? 'الامتثال لأنظمة البنك المركزي (SAMA): ' : 'SAMA Regulatory Alignment: ') + '</strong>' +
        (isAr ? 'تخضع جميع المعاملات المالية لضوابط مكافحة غسل الأموال ومطابقة هوية المستفيد المعتمدة رسمياً في المملكة.' : 'All financial transfers and calculations follow official Kingdom AML frameworks and recipient verification protocols.') + '</div>' +
      '</div>' +
      '<div style="display:flex; gap:8px; margin-bottom:8px;">' +
        '<span style="color:#16a34a; font-weight:700;">✓</span>' +
        '<div><strong>' + (isAr ? 'معايير منصة قوى 2026: ' : 'Qiwa Labor Benchmarks 2026: ') + '</strong>' +
        (isAr ? 'الحسابات العمالية ومستحقات نهاية الخدمة والبدلات متوافقة مع المادتين 84 و85 من نظام العمل السعودي.' : 'Employment calculations and EOSB entitlements align with Articles 84 & 85 of Saudi Labor Law.') + '</div>' +
      '</div>';
    }

    var guidelinesContent = '<div>' +
      '<div style="border-bottom:1.5px solid #e2e8f0; padding-bottom:6px; margin-bottom:12px;">' +
        '<h2 style="font-size:14px; font-weight:700; color:#0f172a; margin:0;">' +
          (isAr ? 'إرشادات وضوابط الحساب الرسمية لعام 2026' : 'Official Guidelines & Calculation Standards 2026') +
        '</h2>' +
      '</div>' +
      '<div style="font-size:11px; color:#334155; line-height:1.55;">' + rulesHtml + '</div>' +
    '</div>';

    var footerContent = '<div style="border-top:1.5px solid #0284c7; padding-top:12px; margin-top:24px; text-align:center;">' +
      '<div style="font-size:11.5px; font-weight:600; color:#0f172a; margin-bottom:4px;">' +
        '<span>' + (isAr ? 'للتحقق من صحة هذا التقرير أو إعادة الحساب:' : 'To verify the authenticity of this report or recalculate:') + '</span>' +
      '</div>' +
      '<div style="margin-bottom:8px;">' +
        '<a href="' + canonicalUrl + '" style="color:#0284c7; font-weight:700; font-size:12px; text-decoration:underline;">' + canonicalUrl + '</a>' +
      '</div>' +
      '<div style="font-size:9.5px; color:#64748b; max-width:600px; margin:0 auto; line-height:1.4;">' +
        (isAr ? 'تم استخراج هذا التقرير آلياً عبر منصة DailyCalcHubs المعتمدة للحاسبات الرقمية في المملكة العربية السعودية. جميع العمليات الحسابية مبنية على أحدث الأنظمة الحكومية والبنكية المعمول بها لعام 2026.' : 'This summary was generated electronically via DailyCalcHubs. Calculations reflect official Kingdom of Saudi Arabia regulatory frameworks (SAMA / ZATCA / Qiwa).') +
      '</div>' +
      '<div style="font-size:9px; color:#94a3b8; margin-top:6px;">' +
        '© 2026 DailyCalcHubs. All rights reserved.' +
      '</div>' +
    '</div>';

    page3.innerHTML = guidelinesContent + footerContent;
    root.appendChild(page3);

    // Mount to DOM for render
    document.body.appendChild(root);

    try {
      var opt = {
        margin: [8, 8, 8, 8],
        filename: opts.fileName || 'DailyCalcHubs_Calculation.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollY: 0,
          scrollX: 0,
          width: 794,
          windowWidth: 794
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        },
        pagebreak: {
          mode: ['avoid-all', 'css', 'legacy']
        }
      };

      var pdfBlob = await window.html2pdf().set(opt).from(root).output('blob');
      return pdfBlob;
    } finally {
      if (root.parentNode) root.parentNode.removeChild(root);
    }
  }

  /**
   * Action 1: PRINT / SHARE CALCULATION PDF SUMMARY
   * - DESKTOP: Strictly preserves original browser print/save PDF flow (window.print())
   * - MOBILE: Generates authentic vector/canvas PDF and invokes native Web Share sheet with file attached
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
    // MOBILE: GENERATE REAL PDF & OPEN NATIVE WEB SHARE WITH FILE ATTACHED
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

      // Extract Tool Lead / Description
      var toolLead = '';
      var leadEl = document.querySelector('.tool-lead, .calc-hero p, .hero-desc');
      if (leadEl) toolLead = cleanText(leadEl.innerText);

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

      // 6. Attempt Server PDF generation first (with short 2.5s timeout)
      var pdfBlob = null;
      var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
      var timeoutId = controller ? setTimeout(function() { controller.abort(); }, 2500) : null;

      try {
        var inputsState = extractCalculatorState();
        var response = await fetch('/api/export-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: currentPath,
            inputs: inputsState
          }),
          signal: controller ? controller.signal : undefined
        });
        if (timeoutId) clearTimeout(timeoutId);

        if (response.ok && response.headers.get('content-type') && response.headers.get('content-type').indexOf('application/pdf') !== -1) {
          pdfBlob = await response.blob();
        }
      } catch (netErr) {
        if (timeoutId) clearTimeout(timeoutId);
        // Server unreachable or timed out: fall back seamlessly to client generation
      }

      // 7. If Server PDF was not available, generate genuine PDF directly via Client Engine
      if (!pdfBlob || pdfBlob.size < 1000) {
        try {
          var userInputs = extractUserInputsList();
          pdfBlob = await generateClientPdfBlob({
            isAr: isAr,
            toolTitle: toolTitle,
            toolLead: toolLead,
            canonicalUrl: canonicalUrl,
            container: container,
            inputs: userInputs,
            fileName: fileName
          });
        } catch (clientErr) {
          console.error('DailyCalcHubs: Client PDF generation error', clientErr);
        }
      }

      // 8. Dispatch Real PDF File via Native Web Share API
      if (pdfBlob && pdfBlob.size > 500) {
        var shareText = (isAr ? 'تقرير حساب من DailyCalcHubs: ' : 'DailyCalcHubs Calculation Report: ') + toolTitle +
                        '\n' + (isAr ? 'للتحقق وإعادة الحساب: ' : 'Verify / Recalculate: ') + canonicalUrl;

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
              return; // Clean user cancel without doing anything
            }
          }
        }

        // If Web Share API Level 2 file sharing is not supported by the browser:
        if (!fileShared) {
          downloadPdfBlob(pdfBlob, fileName);
          alert(isAr ? 'تم تنزيل تقرير PDF بنجاح على جهازك لمشاركته مباشرة عبر واتساب.' : 'PDF report downloaded successfully to your device for direct sharing on WhatsApp.');
        }
      } else {
        alert(isAr ? 'تعذر إنشاء تقرير PDF حالياً. يرجى المحاولة مرة أخرى.' : 'Unable to generate PDF report at this time. Please try again.');
      }

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
