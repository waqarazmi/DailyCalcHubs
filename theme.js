/**
 * DailyCalcHubs — Theme Manager (Light / Dark Mode)
 * Shared preference key: dch_theme ('light' | 'dark')
 * High-performance, zero dependencies, accessible, FOUC-free
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'dch_theme';

  /**
   * Determine effective theme preference:
   * 1. Saved localStorage preference
   * 2. System prefers-color-scheme
   * 3. Fallback to 'light'
   */
  function getPreferredTheme() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch (e) {
      // localStorage may be inaccessible (private mode / sandboxed iframe)
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }

  /**
   * Apply theme to <html> data-theme attribute and update all toggle buttons
   */
  function applyTheme(theme, persist) {
    if (theme !== 'light' && theme !== 'dark') {
      theme = 'light';
    }

    document.documentElement.setAttribute('data-theme', theme);

    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch (e) {}
    }

    updateToggleButtons(theme);
  }

  /**
   * Update visual state and ARIA accessibility of theme toggle buttons
   */
  function updateToggleButtons(theme) {
    var isDark = theme === 'dark';
    var isArabic = document.documentElement.getAttribute('lang') === 'ar';
    var buttons = document.querySelectorAll('#dchThemeToggle, .dch-theme-toggle');

    var label = isArabic
      ? (isDark ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي')
      : (isDark ? 'Switch to light mode' : 'Switch to dark mode');

    var titleText = isArabic
      ? (isDark ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي')
      : (isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');

    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', titleText);

      var icon = btn.querySelector('i');
      if (icon) {
        if (isDark) {
          icon.className = 'fas fa-sun';
        } else {
          icon.className = 'fas fa-moon';
        }
      }
    }
  }

  /**
   * Toggle between light and dark modes
   */
  function toggleTheme() {
    var currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    var nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme, true);
  }

  /**
   * Initialize theme system and event listeners
   */
  function initTheme() {
    var theme = getPreferredTheme();
    applyTheme(theme, false);

    // Bind click events to all matching toggle buttons
    var buttons = document.querySelectorAll('#dchThemeToggle, .dch-theme-toggle');
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      btn.removeEventListener('click', toggleTheme);
      btn.addEventListener('click', toggleTheme);
    }

    // System theme change listener (only triggers if user hasn't explicitly set preference)
    if (window.matchMedia) {
      try {
        var mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        var handleSystemChange = function (e) {
          try {
            var manualPref = localStorage.getItem(STORAGE_KEY);
            if (!manualPref) {
              applyTheme(e.matches ? 'dark' : 'light', false);
            }
          } catch (err) {}
        };

        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener('change', handleSystemChange);
        } else if (mediaQuery.addListener) {
          mediaQuery.addListener(handleSystemChange);
        }
      } catch (mqErr) {}
    }
  }

  // Run init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }

  // Public API on window for testing and programmatic access
  window.DailyCalcHubsTheme = {
    get: function () {
      return document.documentElement.getAttribute('data-theme') || 'light';
    },
    set: function (theme) {
      applyTheme(theme, true);
    },
    toggle: toggleTheme
  };

  // -------------------------------------------------------------
  // Sitewide Cookie Consent System
  // -------------------------------------------------------------
  var COOKIE_KEY = 'dch_cookie_consent';

  function getConsent() {
    try {
      return localStorage.getItem(COOKIE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setConsent(choice) {
    try {
      localStorage.setItem(COOKIE_KEY, choice);
    } catch (e) {}

    if (choice === 'essential') {
      window['ga-disable-G-18Y3LNHDR8'] = true;
    } else if (choice === 'all') {
      window['ga-disable-G-18Y3LNHDR8'] = false;
    }

    var banner = document.getElementById('cookieConsentBanner');
    if (banner) {
      banner.style.display = 'none';
    }
  }

  function renderCookieBanner() {
    var consent = getConsent();
    if (consent === 'essential') {
      window['ga-disable-G-18Y3LNHDR8'] = true;
    }

    var existingBanner = document.getElementById('cookieConsentBanner');
    if (existingBanner) {
      if (!consent) {
        existingBanner.style.display = 'block';
      }
      return;
    }

    if (!consent) {
      injectCookieBanner();
    }
  }

  function injectCookieBanner() {
    if (document.getElementById('cookieConsentBanner')) return;

    var isAr = document.documentElement.getAttribute('lang') === 'ar';
    var banner = document.createElement('div');
    banner.id = 'cookieConsentBanner';
    banner.className = 'cookie-consent-banner';

    if (isAr) {
      banner.innerHTML = [
        '<div class="cookie-consent-container">',
        '  <div class="cookie-consent-text">',
        '    <i class="fas fa-cookie-bite" style="color: #38bdf8; margin-left: 6px;"></i>',
        '    نستخدم ملفات تعريف الارتباط الأساسية لضمان عمل الأدوات الحسابية وتذكر تفضيلاتك وتطوير خدماتنا وفقاً لـ <a href="/ar/privacy-policy/">سياسة الخصوصية</a>.',
        '  </div>',
        '  <div class="cookie-consent-actions">',
        '    <button type="button" class="cookie-btn cookie-btn-secondary" onclick="window.DailyCalcHubsCookies.choose(\'essential\')">الأساسية فقط</button>',
        '    <button type="button" class="cookie-btn cookie-btn-primary" onclick="window.DailyCalcHubsCookies.choose(\'all\')">قبول الكل</button>',
        '  </div>',
        '</div>'
      ].join('\n');
    } else {
      banner.innerHTML = [
        '<div class="cookie-consent-container">',
        '  <div class="cookie-consent-text">',
        '    <i class="fas fa-cookie-bite" style="color: #38bdf8; margin-right: 6px;"></i>',
        '    We use essential cookies to ensure calculation tools operate smoothly and remember your preferences per our <a href="/privacy-policy/">Privacy Policy</a>.',
        '  </div>',
        '  <div class="cookie-consent-actions">',
        '    <button type="button" class="cookie-btn cookie-btn-secondary" onclick="window.DailyCalcHubsCookies.choose(\'essential\')">Essential Only</button>',
        '    <button type="button" class="cookie-btn cookie-btn-primary" onclick="window.DailyCalcHubsCookies.choose(\'all\')">Accept All</button>',
        '  </div>',
        '</div>'
      ].join('\n');
    }

    document.body.appendChild(banner);
    banner.style.display = 'block';
  }

  function openConsentSettings() {
    var banner = document.getElementById('cookieConsentBanner');
    if (!banner) {
      injectCookieBanner();
    } else {
      banner.style.display = 'block';
    }
  }

  function bindConsentTriggers() {
    document.addEventListener('click', function (e) {
      var target = e.target.closest('a[href="#cookie-settings"], [data-cookie-settings], .dch-cookie-settings-trigger');
      if (target) {
        e.preventDefault();
        openConsentSettings();
      }
    });
  }

  // Public Cookie API
  window.DailyCalcHubsCookies = {
    get: getConsent,
    choose: setConsent,
    open: openConsentSettings
  };
  window.openCookieSettings = openConsentSettings;

  // -------------------------------------------------------------
  // Mobile Navigation Drawer — Delegated solely to mobile-nav.js
  // -------------------------------------------------------------
  function bindMobileNav() {
    // Delegated entirely to mobile-nav.js across English and Arabic layouts.
  }


  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      renderCookieBanner();
      bindConsentTriggers();
      bindMobileNav();
    });
  } else {
    renderCookieBanner();
    bindConsentTriggers();
    bindMobileNav();
  }
})();
