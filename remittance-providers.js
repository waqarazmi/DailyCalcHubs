/**
 * DailyCalcHubs — Remittance Providers & Device-Aware Send Money Module
 * Authoritative provider dataset, official branding, and Android/iOS/Desktop link resolution.
 */
(function () {
  'use strict';

  var REMITTANCE_PROVIDERS = [
    {
      id: 'barq',
      nameEn: 'Barq',
      nameAr: 'تطبيق برق (Barq)',
      badgeEn: 'ZERO FEE',
      badgeAr: 'بدون رسوم',
      badgeClass: 'provider-badge-best',
      logoImg: '/assets/img/providers/barq.webp',
      logoSvg: '<svg class="provider-logo-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Barq logo"><rect width="24" height="24" rx="6" fill="#ff5500"/><path d="M14.5 3.5L6.8 12.8h4.6l-2.4 7.7 8.2-10h-4.8l2.1-7z" fill="#ffffff"/></svg>',
      scheme: 'barq',
      pkg: 'sa.com.barraq',
      playUrl: 'https://play.google.com/store/apps/details?id=sa.com.barraq',
      iosUrl: 'https://apps.apple.com/sa/app/barq/id6475736638',
      webUrl: 'https://barq.com',
      feeSar: 0,
      vatSar: 0,
      totalDeduction: 0,
      spreadPct: 0.011, // ~1.1%
      speedEn: 'Instant (2 - 5 mins)',
      speedAr: 'فوري خلال دقائق',
      isInstant: true,
      status: 'ACTIVE'
    },
    {
      id: 'stcpay',
      nameEn: 'STC Pay / STC Bank',
      nameAr: 'STC Pay / بنك STC',
      badgeEn: '',
      badgeAr: '',
      logoImg: '/assets/img/providers/stcbank.webp',
      logoSvg: '<svg class="provider-logo-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="STC Bank logo"><rect width="24" height="24" rx="6" fill="#4f008c"/><path d="M5.5 8.2c2.2-1.5 5.2-1.7 7.7-.5 2 1 3.5 1 5.3.3v2.8c-2.3 1.2-5 1-7.2-.1-2-1-3.6-1-5.8-.3V8.2z" fill="#ff375f"/><path d="M5.5 13.2c2.2-1.5 5.2-1.7 7.7-.5 2 1 3.5 1 5.3.3v2.8c-2.3 1.2-5 1-7.2-.1-2-1-3.6-1-5.8-.3v-2.2z" fill="#ffffff"/></svg>',
      scheme: 'stcpay',
      pkg: 'sa.com.stcbank',
      playUrl: 'https://play.google.com/store/apps/details?id=sa.com.stcbank',
      iosUrl: 'https://apps.apple.com/sa/app/stc-bank/id1438965415',
      webUrl: 'https://www.stcbank.com.sa',
      feeSar: 15.00,
      vatSar: 2.25,
      totalDeduction: 17.25,
      spreadPct: 0.013, // ~1.3%
      speedEn: 'Instant IMPS / Raast',
      speedAr: 'فوري عبر IMPS / Raast',
      isInstant: false,
      status: 'ACTIVE'
    },
    {
      id: 'urpay',
      nameEn: 'urpay (Al Rajhi)',
      nameAr: 'يورباي urpay (مصرف الراجحي)',
      badgeEn: '',
      badgeAr: '',
      logoImg: '/assets/img/providers/urpay.webp',
      logoSvg: '<svg class="provider-logo-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="urpay logo"><rect width="24" height="24" rx="6" fill="#003865"/><path d="M6 7.5v5.2c0 1.6 1.1 2.8 2.6 2.8s2.6-1.2 2.6-2.8V7.5h2v4.8c0 1.2.6 1.8 1.6 1.8.8 0 1.5-.5 1.8-1.2V7.5h2v8h-1.9v-1.2c-.6.8-1.5 1.4-2.6 1.4-1.8 0-2.8-1.1-3.1-2.5C10.3 15 9 15.7 7.7 15.7 5.1 15.7 4 13.9 4 11.5V7.5h2z" fill="#ffffff"/><circle cx="18" cy="5.2" r="1.5" fill="#00d2d3"/></svg>',
      scheme: 'urpay',
      pkg: 'com.urpay.consumer',
      playUrl: 'https://play.google.com/store/apps/details?id=com.urpay.consumer',
      iosUrl: 'https://apps.apple.com/sa/app/urpay/id1541314959',
      webUrl: 'https://urpay.com.sa',
      feeSar: 10.00,
      vatSar: 1.50,
      totalDeduction: 11.50,
      spreadPct: 0.014, // ~1.4%
      speedEn: 'Direct Bank Credit',
      speedAr: 'إيداع بنكي مباشر',
      isInstant: false,
      status: 'ACTIVE'
    },
    {
      id: 'alrajhi',
      nameEn: 'Al Rajhi Bank',
      nameAr: 'مصرف الراجحي (تحويل الراجحي)',
      badgeEn: '',
      badgeAr: '',
      logoImg: '/assets/img/providers/alrajhi.webp',
      logoSvg: '<svg class="provider-logo-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Al Rajhi Bank logo"><rect width="24" height="24" rx="6" fill="#002b7f"/><path d="M12 4.2l5.3 5.3-2.1 2.1-3.2-3.2-3.2 3.2-2.1-2.1L12 4.2zm0 6l3.2 3.2-3.2 3.2-3.2-3.2 3.2-3.2zm-5.3 1.5l2.1 2.1-2.1 2.1L4.6 13.8l2.1-2.1zm10.6 0l2.1 2.1-2.1 2.1-2.1-2.1 2.1-2.1zM12 15.6l3.2 3.2-3.2 1-3.2-1 3.2-3.2z" fill="#ffffff"/></svg>',
      scheme: 'alrajhiretailapp',
      pkg: 'com.alrajhiretailapp',
      playUrl: 'https://play.google.com/store/apps/details?id=com.alrajhiretailapp',
      iosUrl: 'https://apps.apple.com/sa/app/al-rajhi-bank/id1472506080',
      webUrl: 'https://www.alrajhibank.com.sa',
      feeSar: 17.25,
      vatSar: 2.59,
      totalDeduction: 19.84,
      spreadPct: 0.019, // ~1.9%
      speedEn: 'Same Day / Next Day',
      speedAr: 'في نفس اليوم أو اليوم التالي',
      isInstant: false,
      status: 'ACTIVE'
    },
    {
      id: 'enjaz',
      nameEn: 'Enjaz (Bank Albilad)',
      nameAr: 'إنجاز (بنك البلاد)',
      badgeEn: '',
      badgeAr: '',
      logoImg: '/assets/img/providers/enjaz.webp',
      logoSvg: '<svg class="provider-logo-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Enjaz logo"><rect width="24" height="24" rx="6" fill="#007a3d"/><path d="M5.5 17.5l5.5-11 2.5 5 4.5-8v14h-3v-6.5l-3.2 5.5-2.8-4-1.7 5H5.5z" fill="#ffffff"/><path d="M14.5 17.5l3.5-6.5v6.5h-3.5z" fill="#6ee7b7"/></svg>',
      scheme: 'enjaz',
      pkg: 'com.BankAlBilad.EnjazApp',
      playUrl: 'https://play.google.com/store/apps/details?id=com.BankAlBilad.EnjazApp',
      iosUrl: 'https://apps.apple.com/sa/app/enjaz-app/id1453282218',
      webUrl: 'https://enjaz.bankalbilad.com',
      feeSar: 16.50,
      vatSar: 2.48,
      totalDeduction: 18.98,
      spreadPct: 0.017, // ~1.7%
      speedEn: 'Same Day / Instant',
      speedAr: 'في نفس اليوم / فوري',
      isInstant: false,
      status: 'ACTIVE'
    },
    {
      id: 'westernunion',
      nameEn: 'Western Union',
      nameAr: 'ويسترن يونيون (Western Union)',
      badgeEn: '',
      badgeAr: '',
      logoImg: '/assets/img/providers/westernunion.webp',
      logoSvg: '<svg class="provider-logo-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Western Union logo"><rect width="24" height="24" rx="6" fill="#000000"/><path d="M4.5 6.8h2.6l1.8 7.2 2-7.2h2.2l-2.8 10.4H8l-2.1-7.2-1.4 7.2H2.5L4.5 6.8zm7.8 0h2.4v6.8c0 1.2.8 2 2 2s2-.8 2-2V6.8h2.4v6.9c0 2.4-1.8 4-4.4 4s-4.4-1.6-4.4-4V6.8z" fill="#ffdd00"/><path d="M11 11.2l3.8-4.4h2.2l-4.5 5.2 2.2 5.2h-2.3L11 14.3v-3.1z" fill="#ffdd00"/></svg>',
      scheme: 'westernunion',
      pkg: 'com.westernunion.android.mtapp',
      playUrl: 'https://play.google.com/store/apps/details?id=com.westernunion.android.mtapp',
      iosUrl: 'https://apps.apple.com/sa/app/western-union-saudi-arabia/id1489297893',
      webUrl: 'https://www.westernunion.com/sa/en/home.html',
      webUrlAr: 'https://www.westernunion.com/sa/ar/home.html',
      feeSar: 15.00,
      vatSar: 2.25,
      totalDeduction: 17.25,
      spreadPct: 0.018, // ~1.8%
      speedEn: 'Minutes (Cash / Account)',
      speedAr: 'خلال دقائق (نقدي / حساب)',
      isInstant: false,
      status: 'ACTIVE'
    },
    {
      id: 'wise',
      nameEn: 'Wise',
      nameAr: 'وايز (Wise)',
      badgeEn: 'Mid-Market',
      badgeAr: 'سعر السوق',
      badgeClass: 'provider-badge-midmarket',
      logoImg: '/assets/img/providers/wise.webp',
      logoSvg: '<svg class="provider-logo-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Wise logo"><rect width="24" height="24" rx="6" fill="#163300"/><path d="M6.8 6.5h8.8l-3.8 5.4h4.4L8.4 18.2l2.4-5.5H6.8l3.2-4.5H6.8V6.5z" fill="#9fe870"/></svg>',
      scheme: 'wise',
      pkg: 'com.transferwise.android',
      playUrl: 'https://play.google.com/store/apps/details?id=com.transferwise.android',
      iosUrl: 'https://apps.apple.com/app/wise-ex-transferwise/id612261027',
      webUrl: 'https://wise.com',
      status: 'VARIABLE_PRICING',
      spreadPct: 0.002, // Mid-market near zero spread
      variableFeePct: 0.0055, // ~0.55% variable partner clearing fee via linked bank
      speedEn: 'Instant to 24h',
      speedAr: 'فوري حتى 24 ساعة'
    }
  ];

  /**
   * Resolves the device-aware Send Money CTA destination URL.
   * - Android: intent://#Intent;scheme=...;package=...;S.browser_fallback_url=...;end
   * - iOS: Official Apple App Store listing
   * - Desktop: Official Web portal
   */
  function getSendMoneyUrl(provider, isArabic) {
    var ua = navigator.userAgent || '';
    var isAndroid = /android/i.test(ua);
    var isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;

    if (isAndroid && provider.pkg) {
      var encodedPlayUrl = encodeURIComponent(provider.playUrl);
      var schemePart = provider.scheme ? 'scheme=' + provider.scheme + ';' : '';
      return 'intent://#Intent;' + schemePart + 'package=' + provider.pkg + ';S.browser_fallback_url=' + encodedPlayUrl + ';end';
    } else if (isIOS && provider.iosUrl) {
      return provider.iosUrl;
    } else {
      if (isArabic && provider.webUrlAr) {
        return provider.webUrlAr;
      }
      return provider.webUrl;
    }
  }

  /**
   * Formats numbers according to corridor currency locale conventions.
   */
  function formatPayout(val, cur) {
    if (isNaN(val) || val <= 0) return '0.00';
    if (cur === 'INR') {
      return val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    if (cur === 'PHP') {
      return val.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /**
   * Renders the 7 provider rows into the specified tbody element with mobile data-label attributes.
   */
  function renderRemittanceTable(opts) {
    var tbody = typeof opts.tbody === 'string' ? document.getElementById(opts.tbody) : opts.tbody;
    if (!tbody) return;

    var amount = Number(opts.amount) || 1000;
    var cur = opts.currency || 'INR';
    var rate = Number(opts.baseRate) || 0;
    var sym = opts.symbol || '';
    var isArabic = !!opts.isArabic || document.documentElement.lang === 'ar';
    var incentiveMultiplier = Number(opts.incentiveMultiplier) || 1.0; // 1.025 for BDT incentive

    if (!rate || rate <= 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:18px; color:#94a3b8;">' +
        (isArabic ? 'بيانات أسعار الصرف غير متاحة حالياً' : 'Exchange rate data temporarily unavailable') +
        '</td></tr>';
      return;
    }

    var rateLabel = isArabic ? 'سعر التحويل' : 'Retail Rate';
    var feeLabel = isArabic ? 'رسوم التحويل' : 'Transfer Fee';
    var netLabel = isArabic ? 'المبلغ المستلم' : 'You Receive';
    var speedLabel = isArabic ? 'سرعة الإيداع' : 'Speed';

    var html = '';
    for (var i = 0; i < REMITTANCE_PROVIDERS.length; i++) {
      var p = REMITTANCE_PROVIDERS[i];
      var name = isArabic ? p.nameAr : p.nameEn;
      var ctaUrl = getSendMoneyUrl(p, isArabic);
      var ctaText = isArabic ? 'إرسال' : 'Send Money';

      // Badge HTML
      var badgeHtml = '';
      if (isArabic && p.badgeAr) {
        badgeHtml = ' <span class="' + (p.badgeClass || 'provider-badge-best') + '">' + p.badgeAr + '</span>';
      } else if (!isArabic && p.badgeEn) {
        badgeHtml = ' <span class="' + (p.badgeClass || 'provider-badge-best') + '">' + p.badgeEn + '</span>';
      }

      // Calculations per provider status
      var rateCell = '';
      var feeCell = '';
      var netCell = '';
      var speedCell = '';

      if (p.status === 'VARIABLE_PRICING') {
        // Wise: Mid-market rate + variable bank clearing fee
        var wiseRate = rate - (rate * p.spreadPct);
        var wiseFeeSar = amount * p.variableFeePct;
        var wiseNet = Math.max(0, amount - wiseFeeSar) * wiseRate * incentiveMultiplier;

        rateCell = (isArabic ? '<span dir="ltr">' : '') + sym + ' ' + wiseRate.toFixed(2) + (isArabic ? '</span>' : '');
        feeCell = isArabic ? 'متغيرة (~0.55%)' : 'Variable (~0.55%)';
        netCell = '<strong style="font-size:13.5px;' + (isArabic ? ' text-align:right;' : '') + '">' +
          (isArabic ? '<span dir="ltr">' : '') + sym + ' ' + formatPayout(wiseNet, cur) + (isArabic ? '</span>' : '') +
          '</strong>';
        speedCell = '<span style="font-size:12px; color:#64748b;">' + (isArabic ? p.speedAr : p.speedEn) + '</span>';
      } else {
        // Standard Verified Providers (Barq, STC Bank, urpay, Al Rajhi Bank, Enjaz, Western Union)
        var pRate = rate - (rate * p.spreadPct);
        var pNet = Math.max(0, amount - p.totalDeduction) * pRate * incentiveMultiplier;

        rateCell = (isArabic ? '<span dir="ltr">' : '') + sym + ' ' + pRate.toFixed(2) + (isArabic ? '</span>' : '');
        
        if (p.feeSar === 0) {
          feeCell = isArabic ? '<strong style="color:#16a34a;">0.00 ر.س (مجاني)</strong>' : '<strong style="color:#16a34a;">0.00 SAR</strong>';
        } else {
          feeCell = isArabic ? (p.feeSar.toFixed(2) + ' ر.س (+15% ضريبة)') : (p.feeSar.toFixed(2) + ' SAR (+15% VAT)');
        }

        var isBest = p.id === 'barq';
        var netColor = isBest ? '#16a34a' : 'inherit';
        netCell = '<strong style="color:' + netColor + '; font-size:13.5px;' + (isArabic ? ' text-align:right;' : '') + '">' +
          (isArabic ? '<span dir="ltr">' : '') + sym + ' ' + formatPayout(pNet, cur) + (isArabic ? '</span>' : '') +
          '</strong>';

        var speedColor = p.isInstant ? '#16a34a' : '#64748b';
        var speedIcon = p.isInstant ? '<i class="fas fa-bolt" style="color:#16a34a; font-size:11px;"></i> ' : '';
        speedCell = '<span style="color:' + speedColor + '; font-size:12px;">' + speedIcon + (isArabic ? p.speedAr : p.speedEn) + '</span>';
      }

      var isAndroid = /android/i.test(navigator.userAgent || '');
      var ctaTarget = isAndroid ? '' : ' target="_blank" rel="noopener noreferrer"';

      var logoHtml = p.logoImg
        ? '<img class="provider-logo-img" src="' + p.logoImg + '" alt="' + p.nameEn + ' logo" width="28" height="28" loading="lazy" />'
        : p.logoSvg;

      html += '<tr>' +
        '<td class="provider-cell-header">' +
          '<div class="provider-name-cell">' +
            logoHtml +
            '<div>' +
              '<strong>' + name + '</strong>' +
              badgeHtml +
            '</div>' +
          '</div>' +
        '</td>' +
        '<td class="provider-cell-rate" data-label="' + rateLabel + '"' + (isArabic ? ' dir="ltr" style="text-align:right;"' : '') + '>' + rateCell + '</td>' +
        '<td class="provider-cell-fee" data-label="' + feeLabel + '">' + feeCell + '</td>' +
        '<td class="provider-cell-net" data-label="' + netLabel + '"' + (isArabic ? ' dir="ltr" style="text-align:right;"' : '') + '>' + netCell + '</td>' +
        '<td class="provider-cell-speed" data-label="' + speedLabel + '">' + speedCell + '</td>' +
        '<td class="provider-cell-cta">' +
          '<a href="' + ctaUrl + '" class="provider-cta-btn"' + ctaTarget + ' aria-label="' + ctaText + ' with ' + p.nameEn + '">' +
            '<span>' + ctaText + '</span>' +
            '<i class="fas fa-arrow-up-right-from-square"></i>' +
          '</a>' +
        '</td>' +
      '</tr>';
    }

    tbody.innerHTML = html;
  }

  /**
   * Initializes static CTA buttons on page load with device-aware URLs.
   */
  function initCtaButtons() {
    var btns = document.querySelectorAll('a.provider-cta-btn[data-provider]');
    var isArabic = document.documentElement.lang === 'ar';
    var isAndroid = /android/i.test(navigator.userAgent || '');
    for (var i = 0; i < btns.length; i++) {
      var btn = btns[i];
      var pid = btn.getAttribute('data-provider');
      for (var j = 0; j < REMITTANCE_PROVIDERS.length; j++) {
        if (REMITTANCE_PROVIDERS[j].id === pid) {
          btn.href = getSendMoneyUrl(REMITTANCE_PROVIDERS[j], isArabic);
          if (isAndroid) {
            btn.removeAttribute('target');
            btn.removeAttribute('rel');
          }
          break;
        }
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCtaButtons);
  } else {
    initCtaButtons();
  }

  // Export to global scope
  window.DailyCalcRemittance = {
    providers: REMITTANCE_PROVIDERS,
    getSendMoneyUrl: getSendMoneyUrl,
    renderTable: renderRemittanceTable,
    initCtaButtons: initCtaButtons
  };

})();
