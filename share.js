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
   * Pure Client-Side Standard PDF 1.4 Binary Generator
   * Wraps JPEG canvas image into standard single-page A4 PDF without external libraries.
   */
  function buildPdfBlobFromJpeg(jpegUint8Array, width, height) {
    var a4Width = 595.28;
    var a4Height = 841.89;
    var margin = 20;
    var maxWidth = a4Width - (margin * 2);
    var maxHeight = a4Height - (margin * 2);
    var imgRatio = width / height;
    var pageRatio = maxWidth / maxHeight;

    var renderW, renderH;
    if (imgRatio > pageRatio) {
      renderW = maxWidth;
      renderH = maxWidth / imgRatio;
    } else {
      renderH = maxHeight;
      renderW = maxHeight * imgRatio;
    }

    var posX = (a4Width - renderW) / 2;
    var posY = (a4Height - renderH) / 2;

    var encoder = new TextEncoder();
    var obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
    var obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
    var obj3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + a4Width.toFixed(2) + ' ' + a4Height.toFixed(2) + '] /Contents 4 0 R /Resources << /XObject << /Im1 5 0 R >> >> >>\nendobj\n';
    var contentStream = 'q\n' + renderW.toFixed(2) + ' 0 0 ' + renderH.toFixed(2) + ' ' + posX.toFixed(2) + ' ' + posY.toFixed(2) + ' cm\n/Im1 Do\nQ\n';
    var obj4 = '4 0 obj\n<< /Length ' + contentStream.length + ' >>\nstream\n' + contentStream + 'endstream\nendobj\n';
    var imgHeader = '5 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + width + ' /Height ' + height + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + jpegUint8Array.length + ' >>\nstream\n';
    var imgFooter = '\nendstream\nendobj\n';

    var header = '%PDF-1.4\n';
    var bHeader = encoder.encode(header);
    var bObj1 = encoder.encode(obj1);
    var bObj2 = encoder.encode(obj2);
    var bObj3 = encoder.encode(obj3);
    var bObj4 = encoder.encode(obj4);
    var bImgHeader = encoder.encode(imgHeader);
    var bImgFooter = encoder.encode(imgFooter);

    var offset1 = bHeader.length;
    var offset2 = offset1 + bObj1.length;
    var offset3 = offset2 + bObj2.length;
    var offset4 = offset3 + bObj3.length;
    var offset5 = offset4 + bObj4.length;
    var endObj5 = offset5 + bImgHeader.length + jpegUint8Array.length + bImgFooter.length;

    function pad10(n) {
      return ('0000000000' + n).slice(-10);
    }

    var xref = 'xref\n0 6\n0000000000 65535 f \n' +
               pad10(offset1) + ' 00000 n \n' +
               pad10(offset2) + ' 00000 n \n' +
               pad10(offset3) + ' 00000 n \n' +
               pad10(offset4) + ' 00000 n \n' +
               pad10(offset5) + ' 00000 n \n';
    var trailer = 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + endObj5 + '\n%%EOF\n';

    var bXref = encoder.encode(xref);
    var bTrailer = encoder.encode(trailer);

    var totalLen = endObj5 + bXref.length + bTrailer.length;
    var pdf = new Uint8Array(totalLen);
    var p = 0;
    pdf.set(bHeader, p); p += bHeader.length;
    pdf.set(bObj1, p); p += bObj1.length;
    pdf.set(bObj2, p); p += bObj2.length;
    pdf.set(bObj3, p); p += bObj3.length;
    pdf.set(bObj4, p); p += bObj4.length;
    pdf.set(bImgHeader, p); p += bImgHeader.length;
    pdf.set(jpegUint8Array, p); p += jpegUint8Array.length;
    pdf.set(bImgFooter, p); p += bImgFooter.length;
    pdf.set(bXref, p); p += bXref.length;
    pdf.set(bTrailer, p); p += bTrailer.length;

    return new Blob([pdf], { type: 'application/pdf' });
  }

  /**
   * Render High-Resolution Calculation Summary Document onto Canvas
   */
  function renderCalculationDocument(data, isAr, callback) {
    var width = 1200;
    var height = 1600;
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');

    // Page Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Top Brand Color Accent
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 0, width, 14);

    var pad = 80;
    var y = 85;
    var fontFamily = isAr ? '"Cairo", system-ui, -apple-system, sans-serif' : 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

    // 1. Header Branding
    ctx.textAlign = isAr ? 'right' : 'left';
    ctx.direction = isAr ? 'rtl' : 'ltr';
    var startX = isAr ? width - pad : pad;

    ctx.font = 'bold 36px ' + fontFamily;
    ctx.fillStyle = '#0f172a';
    ctx.fillText('DailyCalcHubs', startX, y);

    y += 42;
    ctx.font = '600 20px ' + fontFamily;
    ctx.fillStyle = '#64748b';
    ctx.fillText(isAr ? 'منصة الحاسبات والأدوات الذكية المعتمدة' : 'Official Financial & Smart Calculation Summary', startX, y);

    // Date & Domain on the trailing side
    ctx.textAlign = isAr ? 'left' : 'right';
    ctx.direction = 'ltr';
    var dateX = isAr ? pad : width - pad;
    ctx.font = '500 18px ' + fontFamily;
    ctx.fillStyle = '#94a3b8';
    var now = new Date();
    var dateStr = now.toLocaleDateString(isAr ? 'ar-SA' : 'en-GB') + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    ctx.fillText(dateStr, dateX, 85);
    ctx.fillText('dailycalchubs.com', dateX, 115);

    // Decorative Divider
    y += 35;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(width - pad, y);
    ctx.stroke();

    // 2. Tool Title
    y += 50;
    ctx.textAlign = isAr ? 'right' : 'left';
    ctx.direction = isAr ? 'rtl' : 'ltr';
    ctx.font = 'bold 34px ' + fontFamily;
    ctx.fillStyle = '#0f172a';
    ctx.fillText(data.toolTitle, startX, y);

    // 3. Primary Highlight Result Card (Deep Navy)
    y += 40;
    var cardH = 260;
    ctx.fillStyle = '#0b1329';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(pad, y, width - (pad * 2), cardH, 20);
    } else {
      ctx.rect(pad, y, width - (pad * 2), cardH);
    }
    ctx.fill();

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inside Card: Result Label
    var cardStartX = isAr ? width - pad - 45 : pad + 45;
    ctx.textAlign = isAr ? 'right' : 'left';
    ctx.direction = isAr ? 'rtl' : 'ltr';
    ctx.font = '600 22px ' + fontFamily;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(data.primaryLabel || (isAr ? 'النتيجة الإجمالية' : 'CALCULATION RESULT'), cardStartX, y + 65);

    // Inside Card: Big Amount
    ctx.font = 'bold 64px ' + fontFamily;
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(data.primaryVal, cardStartX, y + 155);

    // Inside Card: Status Tag / Rate Tag
    if (data.statusTag) {
      ctx.font = 'bold 20px ' + fontFamily;
      ctx.fillStyle = '#34d399';
      ctx.fillText(data.statusTag, cardStartX, y + 215);
    }

    // 4. Breakdown & Secondary Details
    y += cardH + 50;
    ctx.font = 'bold 26px ' + fontFamily;
    ctx.fillStyle = '#0f172a';
    ctx.fillText(isAr ? 'تفاصيل الحساب والمعطيات' : 'Calculation Breakdown & Details', startX, y);

    var details = data.details || [];
    y += 20;
    var itemH = 75;
    for (var i = 0; i < details.length && i < 5; i++) {
      var itemY = y + (i * (itemH + 14));
      ctx.fillStyle = (i % 2 === 0) ? '#f8fafc' : '#ffffff';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(pad, itemY, width - (pad * 2), itemH, 12);
      } else {
        ctx.rect(pad, itemY, width - (pad * 2), itemH);
      }
      ctx.fill();
      ctx.stroke();

      var label = details[i].label;
      var val = details[i].val;

      // Label (Start side)
      ctx.textAlign = isAr ? 'right' : 'left';
      ctx.direction = isAr ? 'rtl' : 'ltr';
      ctx.font = '600 22px ' + fontFamily;
      ctx.fillStyle = '#475569';
      ctx.fillText(label, isAr ? width - pad - 30 : pad + 30, itemY + 46);

      // Value (End side)
      ctx.textAlign = isAr ? 'left' : 'right';
      ctx.direction = 'ltr';
      ctx.font = 'bold 24px ' + fontFamily;
      ctx.fillStyle = '#0f172a';
      ctx.fillText(val, isAr ? pad + 30 : width - pad - 30, itemY + 46);
    }

    // 5. Verification & Security Footer Box
    var footerY = 1380;
    var footerH = 150;
    ctx.fillStyle = '#f0f9ff';
    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(pad, footerY, width - (pad * 2), footerH, 16);
    } else {
      ctx.rect(pad, footerY, width - (pad * 2), footerH);
    }
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = isAr ? 'right' : 'left';
    ctx.direction = isAr ? 'rtl' : 'ltr';
    ctx.font = 'bold 20px ' + fontFamily;
    ctx.fillStyle = '#0369a1';
    ctx.fillText(isAr ? 'للتحقق من هذا الحساب أو إعادة الحساب عبر الرابط المباشر:' : 'Verify or recalculate this calculation summary online at:', isAr ? width - pad - 30 : pad + 30, footerY + 50);

    ctx.font = 'bold 22px ' + fontFamily;
    ctx.fillStyle = '#0284c7';
    ctx.direction = 'ltr';
    ctx.textAlign = isAr ? 'right' : 'left';
    ctx.fillText(data.canonicalUrl, isAr ? width - pad - 30 : pad + 30, footerY + 95);

    ctx.font = '500 16px ' + fontFamily;
    ctx.fillStyle = '#64748b';
    ctx.textAlign = isAr ? 'right' : 'left';
    ctx.direction = isAr ? 'rtl' : 'ltr';
    ctx.fillText(isAr ? 'تقرير رسمي صادر عن DailyCalcHubs • جميع الحسابات استرشادية وفق الأنظمة واللوائح المعتمدة' : 'Official calculation report by DailyCalcHubs • Designed strictly for personal planning & reference', isAr ? width - pad - 30 : pad + 30, footerY + 128);

    // Convert to JPEG and generate PDF Blob
    canvas.toBlob(function(blob) {
      var reader = new FileReader();
      reader.onload = function() {
        var u8 = new Uint8Array(reader.result);
        var pdfBlob = buildPdfBlobFromJpeg(u8, width, height);
        callback(pdfBlob);
      };
      reader.readAsArrayBuffer(blob);
    }, 'image/jpeg', 0.94);
  }

  /**
   * Extraction Utility: Collect Active Calculation Data from Page
   */
  function extractCalculationData(btn) {
    var container = btn && btn.closest ? 
      btn.closest('.result-summary-box, .results-panel, .mini-result-box, .calc-card, .calculator-card') : null;

    // 1. Tool Title
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

    // 2. Primary Result Value & Label
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

    // Standalone fallback element IDs
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

    // 3. Status Tag / Rate Tag
    var statusTag = '';
    if (container) {
      var rateTag = container.querySelector('.result-rate-tag, .badge-status, #resCategoryText, #resCategoryBadge');
      if (rateTag) {
        statusTag = cleanText(rateTag.innerText);
      }
    }

    // 4. Secondary Breakdown Details
    var details = [];
    if (container) {
      // Check for Meta Boxes / Stat Pills
      var metaItems = container.querySelectorAll('.meta-box-inner, .stat-pill');
      for (var m = 0; m < metaItems.length && details.length < 5; m++) {
        var item = metaItems[m];
        var tEl = item.querySelector('.meta-box-title, .stat-label');
        var vEl = item.querySelector('.meta-box-val, .stat-val');
        if (tEl && vEl) {
          var t = cleanText(tEl.innerText);
          var v = cleanText(vEl.innerText);
          if (t && v) details.push({ label: t, val: v });
        }
      }

      // Check for Mini Sub-Stats
      if (details.length === 0) {
        var subStatRows = container.querySelectorAll('.mini-sub-stat-row');
        for (var s = 0; s < subStatRows.length && details.length < 5; s++) {
          var rowTxt = cleanText(subStatRows[s].innerText);
          if (rowTxt) {
            var parts = rowTxt.split(':');
            if (parts.length >= 2) {
              details.push({ label: cleanText(parts[0]), val: cleanText(parts.slice(1).join(':')) });
            } else {
              details.push({ label: rowTxt, val: '' });
            }
          }
        }
      }

      // Check for Breakdown Table Rows
      if (details.length === 0) {
        var tableRows = container.querySelectorAll('.breakdown-table tr');
        for (var r = 0; r < tableRows.length && details.length < 5; r++) {
          var cells = tableRows[r].querySelectorAll('td');
          if (cells.length >= 2) {
            var rowLabel = cleanText(cells[0].innerText);
            var rowVal = cleanText(cells[1].innerText);
            if (rowLabel && rowVal && !tableRows[r].classList.contains('highlight-row')) {
              details.push({ label: rowLabel, val: rowVal });
            }
          }
        }
      }
    }

    return {
      toolTitle: toolTitle,
      primaryVal: primaryVal,
      primaryLabel: primaryLabel,
      statusTag: statusTag,
      details: details,
      canonicalUrl: getCanonicalCalculatorUrl()
    };
  }

  /**
   * Action 1: SHARE PDF ON WHATSAPP (Real PDF Generation + Safe WhatsApp Share Flow)
   */
  window.dchSharePdfWhatsApp = function(btn) {
    try {
      var isAr = (document.documentElement.getAttribute('lang') === 'ar' || document.documentElement.lang === 'ar');
      var data = extractCalculationData(btn);

      // Validation
      if (!data.primaryVal || data.primaryVal === '--' || data.primaryVal === '0.00 SAR') {
        alert(isAr ? 'يرجى إجراء الحساب أولاً لإنشاء ومشاركة تقرير PDF.' : 'Please perform a calculation first to generate and share your PDF summary.');
        return;
      }

      // Button Loading Feedback
      var originalHtml = btn ? btn.innerHTML : '';
      if (btn) {
        btn.disabled = true;
        btn.style.opacity = '0.75';
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>' + (isAr ? 'جاري إعداد PDF...' : 'Preparing PDF...') + '</span>';
      }

      function restoreButton() {
        if (btn) {
          btn.disabled = false;
          btn.style.opacity = '1';
          btn.innerHTML = originalHtml;
        }
      }

      // Clean file name
      var slug = data.toolTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (!slug || slug === '-') slug = 'calculation-summary';
      var fileName = 'DailyCalcHubs-' + slug + '.pdf';

      // Assemble WhatsApp accompanying message
      var lines = [];
      lines.push(isAr ? '*ملخص تقرير DailyCalcHubs (PDF)*' : '*DailyCalcHubs Calculation Report (PDF)*');
      lines.push((isAr ? 'الأداة: ' : 'Tool: ') + data.toolTitle);
      if (data.primaryLabel) {
        lines.push('*' + data.primaryLabel + ':* ' + data.primaryVal);
      } else {
        lines.push((isAr ? '*النتيجة:* ' : '*Result:* ') + data.primaryVal);
      }
      if (data.details && data.details.length > 0) {
        lines.push('');
        lines.push(isAr ? '*أهم المعطيات:*' : '*Key Metrics:*');
        for (var d = 0; d < data.details.length; d++) {
          lines.push('- ' + data.details[d].label + ': ' + data.details[d].val);
        }
      }
      lines.push('');
      lines.push(isAr ? 'رابط التحقق والحساب المباشر:' : 'Direct verification link:');
      lines.push(data.canonicalUrl);

      var shareText = lines.join('\n');

      // Generate the real PDF Blob
      renderCalculationDocument(data, isAr, function(pdfBlob) {
        try {
          var pdfFile = null;
          try {
            pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf', lastModified: Date.now() });
          } catch (e) {
            // Older browser fallback for File constructor
          }

          // Case A: Real PDF File Sharing via Native Web Share API (Mobile Safari, Mobile Chrome, etc.)
          if (pdfFile && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
            navigator.share({
              files: [pdfFile],
              title: data.toolTitle,
              text: shareText
            }).then(function() {
              restoreButton();
            }).catch(function(err) {
              restoreButton();
              // User aborted or canceled picker
              if (err && err.name !== 'AbortError') {
                fallbackDesktopShare(pdfBlob, fileName, shareText, isAr);
              }
            });
            return;
          }

          // Case B: Desktop / Environment without direct file sharing
          fallbackDesktopShare(pdfBlob, fileName, shareText, isAr);
          restoreButton();

        } catch (innerErr) {
          console.error('DailyCalcHubs: PDF dispatch error', innerErr);
          fallbackDesktopShare(pdfBlob, fileName, shareText, isAr);
          restoreButton();
        }
      });

    } catch (err) {
      console.error('DailyCalcHubs: PDF Generation error', err);
      if (btn) {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.innerHTML = originalHtml;
      }
    }
  };

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
      'تم تنزيل تقرير PDF على جهازك، وجاري فتح واتساب لتتمكن من إرفاقه في المحادثة.' :
      'PDF summary downloaded to your device. Opening WhatsApp so you can attach it to your chat.';
    showToast(toastMsg, isAr);
  }

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
