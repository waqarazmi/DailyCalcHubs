/**
 * DailyCalcHubs - Global Live Forex Ticker
 * Synchronizes top-rates ticker across all internal and hub pages
 * Data source: open.er-api.com (USD base)
 * Includes sessionStorage caching (5 min TTL) for instant 0ms page transitions
 */
(function() {
  'use strict';

  const FX_API_URL = 'https://open.er-api.com/v6/latest/USD';
  const CACHE_KEY = 'dch_forex_cache_v1';
  const CACHE_TTL = 300000; // 5 minutes in ms

  // Reference fallbacks (only used if network is unreachable and cache is empty)
  const FALLBACK_RATES = {
    SAR: 3.75,
    INR: 94.54,   // ~25.21 SAR/INR
    PKR: 278.40,  // ~74.24 SAR/PKR
    BDT: 121.20,  // ~32.32 SAR/BDT
    PHP: 58.70,   // ~15.65 SAR/PHP
    AED: 3.6725,  // ~0.98 SAR/AED
    KWD: 0.3086,  // ~306.33 KWD/INR
    NPR: 138.40,  // ~36.90 SAR/NPR
    LKR: 302.50,  // ~80.66 SAR/LKR
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79
  };

  function updateTickerDOM(rates) {
    if (!rates || !rates.SAR) return;
    const sarRate = rates.SAR;

    // Computed cross-rates from SAR
    const sarInr = rates.INR ? (rates.INR / sarRate) : null;
    const sarPkr = rates.PKR ? (rates.PKR / sarRate) : null;
    const sarBdt = rates.BDT ? (rates.BDT / sarRate) : null;
    const sarPhp = rates.PHP ? (rates.PHP / sarRate) : null;
    const sarNpr = rates.NPR ? (rates.NPR / sarRate) : null;
    const sarLkr = rates.LKR ? (rates.LKR / sarRate) : null;

    // Cross-rates for other currencies
    const aedInr = (rates.AED && rates.INR) ? (rates.INR / rates.AED) : null;
    const kwdInr = (rates.KWD && rates.INR) ? (rates.INR / rates.KWD) : null;
    const sarAed = rates.AED ? (rates.AED / sarRate) : null;
    const sarUsd = rates.USD ? (rates.USD / sarRate) : null;
    const sarEur = rates.EUR ? (rates.EUR / sarRate) : null;

    // Update SAR/INR
    if (sarInr !== null) {
      const elSar = document.getElementById('tickerSar');
      if (elSar) elSar.textContent = '\u20B9 ' + sarInr.toFixed(2);

      // Barq rate = spot minus retail spread (~0.27)
      const elBarq = document.getElementById('tickerBarq');
      if (elBarq) {
        const barqRate = (sarInr - 0.27).toFixed(2);
        elBarq.textContent = '\u20B9 ' + barqRate;
      }
    }

    // Update SAR/PKR
    if (sarPkr !== null) {
      const elPkr = document.getElementById('tickerPkr');
      if (elPkr) elPkr.textContent = 'Rs ' + sarPkr.toFixed(2);
    }

    // Update SAR/BDT
    if (sarBdt !== null) {
      const elBdt = document.getElementById('tickerBdt');
      if (elBdt) elBdt.textContent = '\u09F3 ' + sarBdt.toFixed(2);
    }

    // Update SAR/PHP
    if (sarPhp !== null) {
      const elPhp = document.getElementById('tickerPhp');
      if (elPhp) elPhp.textContent = '\u20B1 ' + sarPhp.toFixed(2);
    }

    // Update AED/INR
    if (aedInr !== null) {
      const elAed = document.getElementById('tickerAed');
      if (elAed) elAed.textContent = '\u20B9 ' + aedInr.toFixed(2);
    }

    // Update KWD/INR
    if (kwdInr !== null) {
      const elKwd = document.getElementById('tickerKwd');
      if (elKwd) elKwd.textContent = '\u20B9 ' + kwdInr.toFixed(2);
    }

    // Update SAR/NPR
    if (sarNpr !== null) {
      const elNpr = document.getElementById('tickerNpr');
      if (elNpr) elNpr.textContent = 'Rs ' + sarNpr.toFixed(2);
    }

    // Update SAR/LKR
    if (sarLkr !== null) {
      const elLkr = document.getElementById('tickerLkr');
      if (elLkr) elLkr.textContent = 'Rs ' + sarLkr.toFixed(2);
    }

    // Update Travel Booking Ticker elements if present
    if (sarAed !== null) {
      const elSarAed = document.getElementById('tickerSarAed');
      if (elSarAed) elSarAed.textContent = sarAed.toFixed(2) + ' AED';
    }
    if (sarUsd !== null) {
      const elSarUsd = document.getElementById('tickerSarUsd');
      if (elSarUsd) elSarUsd.textContent = '$ ' + sarUsd.toFixed(4);
    }
    if (sarEur !== null) {
      const elSarEur = document.getElementById('tickerSarEur');
      if (elSarEur) elSarEur.textContent = '\u20AC ' + sarEur.toFixed(4);
    }
  }

  function readCache() {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      const parsed = JSON.parse(cached);
      if (parsed && parsed.ts && (Date.now() - parsed.ts < CACHE_TTL) && parsed.rates) {
        return parsed;
      }
    } catch (e) {
      // sessionStorage unavailable or JSON parse error
    }
    return null;
  }

  function writeCache(rates) {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        ts: Date.now(),
        rates: rates
      }));
    } catch (e) {
      // quota or private mode
    }
  }

  async function fetchRates() {
    try {
      const res = await fetch(FX_API_URL + '?ts=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) throw new Error('FX API HTTP ' + res.status);
      const data = await res.json();
      if (data && data.rates && data.rates.SAR && data.rates.INR) {
        window.dchLiveRates = data.rates;
        writeCache(data.rates);
        updateTickerDOM(data.rates);
        window.dispatchEvent(new CustomEvent('dchRatesUpdated', { detail: data.rates }));
        return;
      }
      throw new Error('Invalid rate payload');
    } catch (err) {
      console.warn('DCH Ticker: Live rates fetch failed, using fallback:', err.message);
      if (!window.dchLiveRates) {
        window.dchLiveRates = FALLBACK_RATES;
        updateTickerDOM(FALLBACK_RATES);
      }
    }
  }

  // 1. Check cache for instant 0ms render
  const cachedData = readCache();
  if (cachedData) {
    window.dchLiveRates = cachedData.rates;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        updateTickerDOM(cachedData.rates);
      });
    } else {
      updateTickerDOM(cachedData.rates);
    }
    // If cache is older than 60s, fetch fresh in background
    if (Date.now() - cachedData.ts > 60000) {
      fetchRates();
    }
  } else {
    // 2. No cache, fetch fresh
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fetchRates);
    } else {
      fetchRates();
    }
  }

  // Helper function for external scripts if needed
  window.dchGetFxRate = function(base, target) {
    const rates = window.dchLiveRates || FALLBACK_RATES;
    if (!rates || !rates[base] || !rates[target]) return null;
    return rates[target] / rates[base];
  };
})();