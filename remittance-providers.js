/**
 * DailyCalcHubs — Unified Remittance Providers, Rate Engine & Send Money Module
 * Authoritative provider dataset, official branding, unified FX cache, and device-aware CTA URLs.
 */
(function () {
  'use strict';

  var FX_API_URL = 'https://open.er-api.com/v6/latest/USD';
  var CACHE_KEY = 'dch_forex_cache_v3';
  var CACHE_TTL = 300000; // 5 minutes in ms
  var isBackgroundFetching = false;
  var backgroundCallbacks = [];

  // Authoritative verified closing benchmark rates for fallback when offline
  var FALLBACK_RATES = {
    USD: 1.0,
    SAR: 3.75,
    INR: 95.88,   // ~25.568 SAR/INR
    PKR: 277.00,  // ~73.867 SAR/PKR
    BDT: 121.50,  // ~32.400 SAR/BDT
    PHP: 58.70,   // ~15.653 SAR/PHP
    NPR: 153.40,  // ~40.907 SAR/NPR (pegged to INR * 1.60)
    LKR: 302.50,  // ~80.667 SAR/LKR
    EUR: 0.92,
    GBP: 0.78,
    AED: 3.6725,  // ~0.979 SAR/AED
    EGP: 49.30,   // ~13.147 SAR/EGP
    CAD: 1.36
  };

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
      status: 'ACTIVE',
      noteEn: 'Promotional zero transfer fee. Revenue earned via retail exchange spread.',
      noteAr: 'عرض ترويجي بدون رسوم تحويل. تُحصّل الإيرادات من فارق سعر الصرف.'
    },
    {
      id: 'stcpay',
      nameEn: 'STC Bank (formerly STC Pay)',
      nameAr: 'بنك STC (سابقاً STC Pay)',
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
      speedEn: 'Instant IMPS / Raast / Direct',
      speedAr: 'فوري عبر IMPS / Raast / مباشر',
      isInstant: false,
      status: 'ACTIVE',
      noteEn: 'Standard SAMA digital banking tariff (15 SAR + 15% VAT).',
      noteAr: 'تعريفة التحويل الرقمي المعتمدة (15 ر.س + 15% ضريبة القيمة المضافة).'
    },
    {
      id: 'urpay',
      nameEn: 'urpay (by Al Rajhi)',
      nameAr: 'يورباي urpay (من مصرف الراجحي)',
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
      status: 'ACTIVE',
      noteEn: 'Direct digital wallet fee (10 SAR + 1.50 SAR VAT).',
      noteAr: 'رسم تحويل المحفظة الرقمية (10 ر.س + 1.50 ر.س ضريبة).'
    },
    {
      id: 'alrajhi',
      nameEn: 'Tahweel Al Rajhi / Al Rajhi Bank',
      nameAr: 'تحويل الراجحي / مصرف الراجحي',
      badgeEn: '',
      badgeAr: '',
      logoImg: '/assets/img/providers/alrajhi.webp',
      logoSvg: '<svg class="provider-logo-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Al Rajhi Bank logo"><rect width="24" height="24" rx="6" fill="#002b7f"/><path d="M12 4.2l5.3 5.3-2.1 2.1-3.2-3.2-3.2 3.2-2.1-2.1L12 4.2zm0 6l3.2 3.2-3.2 3.2-3.2-3.2 3.2-3.2zm-5.3 1.5l2.1 2.1-2.1 2.1L4.6 13.8l2.1-2.1zm10.6 0l2.1 2.1-2.1 2.1-2.1-2.1 2.1-2.1zM12 15.6l3.2 3.2-3.2 1-3.2-1 3.2-3.2z" fill="#ffffff"/></svg>',
      scheme: 'alrajhiretailapp',
      pkg: 'com.alrajhiretailapp',
      playUrl: 'https://play.google.com/store/apps/details?id=com.alrajhiretailapp',
      iosUrl: 'https://apps.apple.com/sa/app/al-rajhi-bank/id1472506080',
      webUrl: 'https://www.alrajhibank.com.sa',
      feeSar: 15.00,
      vatSar: 2.25,
      totalDeduction: 17.25,
      spreadPct: 0.018, // ~1.8%
      speedEn: 'Same Day / Next Day',
      speedAr: 'في نفس اليوم أو اليوم التالي',
      isInstant: false,
      status: 'ACTIVE',
      noteEn: 'Standard SAMA digital banking tariff (15 SAR + 15% VAT). Branch counter fees may differ.',
      noteAr: 'تعريفة القنوات الرقمية المعتمدة (15 ر.س + 15% ضريبة). قد تختلف رسوم فروع التحويل.'
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
      feeSar: 15.00,
      vatSar: 2.25,
      totalDeduction: 17.25,
      spreadPct: 0.017, // ~1.7%
      speedEn: 'Same Day / Instant IMPS',
      speedAr: 'في نفس اليوم / إيداع فوري',
      isInstant: false,
      status: 'ACTIVE',
      noteEn: 'Standard electronic remittance fee (15 SAR + 15% VAT).',
      noteAr: 'رسم التحويل الإلكتروني المعتمد (15 ر.س + 15% ضريبة).'
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
      status: 'ACTIVE',
      noteEn: 'Digital partner integration fee. Physical cash pickup counters may charge higher.',
      noteAr: 'تسعيرة الشركاء الرقميين. قد تختلف رسوم الاستلام النقدي من الفروع.'
    },
    {
      id: 'wise',
      nameEn: 'Wise',
      nameAr: 'وايز (Wise)',
      badgeEn: 'Mid-Market Partner',
      badgeAr: 'شريك بسعر السوق',
      badgeClass: 'provider-badge-midmarket',
      logoImg: '/assets/img/providers/wise.webp',
      logoSvg: '<svg class="provider-logo-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Wise logo"><rect width="24" height="24" rx="6" fill="#163300"/><path d="M6.8 6.5h8.8l-3.8 5.4h4.4L8.4 18.2l2.4-5.5H6.8l3.2-4.5H6.8V6.5z" fill="#9fe870"/></svg>',
      scheme: 'wise',
      pkg: 'com.transferwise.android',
      playUrl: 'https://play.google.com/store/apps/details?id=com.transferwise.android',
      iosUrl: 'https://apps.apple.com/app/wise-ex-transferwise/id612261027',
      webUrl: 'https://wise.com',
      status: 'VARIABLE_PRICING',
      spreadPct: 0.002, // Mid-market near zero spread (~0.2%)
      variableFeePct: 0.0055, // ~0.55% variable partner clearing fee via card/bank transfer
      speedEn: 'Instant to 24h',
      speedAr: 'فوري حتى 24 ساعة',
      noteEn: 'Global mid-market platform operating via international partner banking networks.',
      noteAr: 'منصة دولية بسعر السوق الفعلي تعمل عبر شبكات بنكية شريكة.'
    }
  ];

  /**
   * Resolves the device-aware Send Money CTA destination URL.
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
   * Reads FX rates from persistent localStorage cache.
   * Returns valid cached object if schema is valid.
   */
  function readCache() {
    try {
      var cached = localStorage.getItem(CACHE_KEY);
      if (!cached) {
        cached = sessionStorage.getItem('dch_forex_cache_v2');
      }
      if (!cached) return null;
      var parsed = JSON.parse(cached);
      if (parsed && parsed.rates && parsed.rates.SAR && parsed.rates.INR) {
        return parsed;
      }
    } catch (e) {}
    return null;
  }

  /**
   * Writes FX rates to persistent localStorage cache.
   */
  function writeCache(rates, rawTimestamp) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        version: 3,
        ts: Date.now(),
        rates: rates,
        rawTimestamp: rawTimestamp || null
      }));
    } catch (e) {}
  }

  // Synchronous early hydration of in-memory live rates from local cache
  var initialCache = readCache();
  if (initialCache && initialCache.rates) {
    window.dchLiveRates = initialCache.rates;
  }

  /**
   * Formats API UTC timestamp into human-readable date/time.
   */
  function formatApiDate(utcString, isArabic) {
    if (!utcString) return null;
    try {
      var d = new Date(utcString);
      if (isNaN(d.getTime())) return null;
      var locale = isArabic ? 'ar-SA' : 'en-US';
      var dateStr = d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
      var timeStr = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
      return dateStr + ' ' + timeStr;
    } catch (e) {
      return null;
    }
  }

  /**
   * Triggers silent background revalidation without clearing or disrupting visible UI.
   */
  function triggerSilentRevalidation(isArabic, isColdFirstVisit) {
    if (isBackgroundFetching) return;
    isBackgroundFetching = true;
    var url = FX_API_URL + '?ts=' + Math.floor(Date.now() / 60000);

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('FX API HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        isBackgroundFetching = false;
        if (data && data.rates && data.rates.SAR && data.rates.INR) {
          window.dchLiveRates = data.rates;
          var rawTs = data.time_last_update_utc || null;
          writeCache(data.rates, rawTs);
          window.dispatchEvent(new CustomEvent('dchRatesUpdated', { detail: data.rates }));

          var formattedDate = formatApiDate(rawTs, isArabic);
          var info = {
            isLive: true,
            rates: data.rates,
            rawTimestamp: rawTs,
            timeFormattedEn: formattedDate ? ('Updated: ' + formattedDate) : 'Daily Spot Benchmark Active',
            timeFormattedAr: formattedDate ? ('تحديث: ' + formattedDate) : 'سعر الصرف المرجعي نشط',
            statusEn: 'Benchmark Active',
            statusAr: 'سعر الصرف المرجعي نشط',
            isFresh: true
          };

          var cbs = backgroundCallbacks.slice();
          backgroundCallbacks = [];
          cbs.forEach(function (cb) {
            try { cb(data.rates, info); } catch (e) {}
          });
        } else {
          throw new Error('Incomplete FX payload');
        }
      })
      .catch(function (err) {
        isBackgroundFetching = false;
        console.warn('DailyCalcHubs: FX fetch fallback active:', err.message);
        var currentRates = window.dchLiveRates || FALLBACK_RATES;
        var offlineInfo = {
          isLive: false,
          rates: currentRates,
          rawTimestamp: null,
          timeFormattedEn: 'Closing Reference Benchmark',
          timeFormattedAr: 'سعر إغلاق مرجعي معتمد',
          statusEn: 'Reference Closing Rate',
          statusAr: 'سعر إغلاق مرجعي'
        };

        if (isColdFirstVisit) {
          window.dchLiveRates = FALLBACK_RATES;
          var cbs = backgroundCallbacks.slice();
          backgroundCallbacks = [];
          cbs.forEach(function (cb) {
            try { cb(FALLBACK_RATES, offlineInfo); } catch (e) {}
          });
        } else {
          // On silent background refresh failure: keep current visible state without disruption
          backgroundCallbacks = [];
        }
      });
  }

  /**
   * Central FX Rate Engine: Fetches rates once, shares across all pages and widgets.
   * Implements Stale-While-Revalidate: instantly restores valid local cache,
   * then revalidates silently in background if stale.
   */
  function fetchRates(callback) {
    var cached = readCache();
    var isArabic = document.documentElement.lang === 'ar';

    if (cached) {
      window.dchLiveRates = cached.rates;
      var formattedCachedDate = formatApiDate(cached.rawTimestamp, isArabic);
      var cachedInfo = {
        isLive: true,
        rates: cached.rates,
        rawTimestamp: cached.rawTimestamp,
        timeFormattedEn: formattedCachedDate ? ('Updated: ' + formattedCachedDate) : 'Spot Benchmark Active',
        timeFormattedAr: formattedCachedDate ? ('تحديث: ' + formattedCachedDate) : 'سعر الصرف المرجعي نشط',
        statusEn: 'Benchmark Active',
        statusAr: 'سعر الصرف المرجعي نشط',
        isCached: true
      };

      if (typeof callback === 'function') {
        try {
          callback(cached.rates, cachedInfo);
        } catch (e) {}
      }

      // If stale (> 5 mins), queue callback and trigger silent background revalidation
      var isStale = !cached.ts || (Date.now() - cached.ts >= CACHE_TTL);
      if (isStale) {
        if (typeof callback === 'function') {
          backgroundCallbacks.push(callback);
        }
        triggerSilentRevalidation(isArabic, false);
      }
      return;
    }

    // Cold first-ever visit: register callback and fetch
    if (typeof callback === 'function') {
      backgroundCallbacks.push(callback);
    }
    triggerSilentRevalidation(isArabic, true);
  }

  /**
   * Calculates cross-rate from SAR to target currency.
   */
  function getRateFromSar(targetCur, customRates) {
    var rates = customRates || window.dchLiveRates || FALLBACK_RATES;
    if (!rates || !rates.SAR || !rates[targetCur]) return null;
    return rates[targetCur] / rates.SAR;
  }

  /**
   * Calculates individual provider payout details.
   */
  function calculateProviderPayout(provider, amount, currency, baseRate, incentiveMultiplier) {
    var amt = Number(amount) || 0;
    var rate = Number(baseRate) || 0;
    var mult = Number(incentiveMultiplier) || 1.0;

    if (amt <= 0 || rate <= 0) {
      return {
        rate: 0,
        feeSar: 0,
        vatSar: 0,
        totalDeduction: 0,
        netPayout: 0,
        formattedPayout: '0.00'
      };
    }

    if (provider.status === 'VARIABLE_PRICING') {
      var wiseRate = rate - (rate * provider.spreadPct);
      var wiseFeeSar = amt * provider.variableFeePct;
      var wiseNet = Math.max(0, amt - wiseFeeSar) * wiseRate * mult;
      return {
        rate: wiseRate,
        feeSar: wiseFeeSar,
        vatSar: 0,
        totalDeduction: wiseFeeSar,
        netPayout: wiseNet,
        formattedPayout: formatPayout(wiseNet, currency)
      };
    }

    var pRate = rate - (rate * provider.spreadPct);
    var pNet = Math.max(0, amt - provider.totalDeduction) * pRate * mult;
    return {
      rate: pRate,
      feeSar: provider.feeSar,
      vatSar: provider.vatSar,
      totalDeduction: provider.totalDeduction,
      netPayout: pNet,
      formattedPayout: formatPayout(pNet, currency)
    };
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
    var incentiveMultiplier = Number(opts.incentiveMultiplier) || 1.0;

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

      var badgeHtml = '';
      if (isArabic && p.badgeAr) {
        badgeHtml = ' <span class="' + (p.badgeClass || 'provider-badge-best') + '">' + p.badgeAr + '</span>';
      } else if (!isArabic && p.badgeEn) {
        badgeHtml = ' <span class="' + (p.badgeClass || 'provider-badge-best') + '">' + p.badgeEn + '</span>';
      }

      var calc = calculateProviderPayout(p, amount, cur, rate, incentiveMultiplier);

      var rateCell = (isArabic ? '<span dir="ltr">' : '') + sym + ' ' + calc.rate.toFixed(2) + (isArabic ? '</span>' : '');
      var feeCell = '';
      if (p.status === 'VARIABLE_PRICING') {
        feeCell = isArabic ? 'متغيرة (~0.55%)' : 'Variable (~0.55%)';
      } else if (p.feeSar === 0) {
        feeCell = isArabic ? '<strong style="color:#16a34a;">0.00 ر.س (مجاني)</strong>' : '<strong style="color:#16a34a;">0.00 SAR (Free)</strong>';
      } else {
        feeCell = isArabic
          ? (p.feeSar.toFixed(2) + ' ر.س (+15% ضريبة)')
          : (p.feeSar.toFixed(2) + ' SAR (+15% VAT)');
      }

      var isBest = p.id === 'barq';
      var netColor = isBest ? '#16a34a' : 'inherit';
      var netCell = '<strong style="color:' + netColor + '; font-size:13.5px;' + (isArabic ? ' text-align:right;' : '') + '">' +
        (isArabic ? '<span dir="ltr">' : '') + sym + ' ' + calc.formattedPayout + (isArabic ? '</span>' : '') +
        '</strong>';

      var speedColor = p.isInstant ? '#16a34a' : '#64748b';
      var speedIcon = p.isInstant ? '<i class="fas fa-bolt" style="color:#16a34a; font-size:11px;"></i> ' : '';
      var speedCell = '<span style="color:' + speedColor + '; font-size:12px;">' + speedIcon + (isArabic ? p.speedAr : p.speedEn) + '</span>';

      var isAndroid = /android/i.test(navigator.userAgent || '');
      var ctaTarget = isAndroid ? '' : ' target="_blank" rel="noopener noreferrer"';

      var logoHtml = p.logoImg
        ? '<img class="provider-logo-img" src="' + p.logoImg + '" alt="' + (isArabic ? ('شعار ' + (p.nameAr || p.nameEn)) : (p.nameEn + ' logo')) + '" width="28" height="28" loading="lazy" />'
        : (isArabic && p.logoSvg ? p.logoSvg.replace(/aria-label="[^"]*"/, 'aria-label="شعار ' + (p.nameAr || p.nameEn) + '"') : p.logoSvg);

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
        '<td class="provider-cell-rate" data-label="' + rateLabel + '">' + rateCell + '</td>' +
        '<td class="provider-cell-fee" data-label="' + feeLabel + '">' + feeCell + '</td>' +
        '<td class="provider-cell-net" data-label="' + netLabel + '">' + netCell + '</td>' +
        '<td class="provider-cell-speed" data-label="' + speedLabel + '">' + speedCell + '</td>' +
        '<td class="provider-cell-cta">' +
          '<a href="' + ctaUrl + '" class="provider-cta-btn"' + ctaTarget + ' aria-label="' + (isArabic ? ('إرسال عبر ' + (p.nameAr || p.nameEn)) : (ctaText + ' with ' + p.nameEn)) + '">' +
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
    fallbackRates: FALLBACK_RATES,
    getSendMoneyUrl: getSendMoneyUrl,
    formatPayout: formatPayout,
    fetchRates: fetchRates,
    getRateFromSar: getRateFromSar,
    calculateProviderPayout: calculateProviderPayout,
    renderTable: renderRemittanceTable,
    initCtaButtons: initCtaButtons
  };

})();
