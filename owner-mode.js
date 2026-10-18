(function() {
  try {
    var params = new URLSearchParams(window.location.search);
    var owner = params.get('owner');
    if (owner === 'waqar_lock') {
      localStorage.setItem('dch_owner_mode', 'active');
      params.delete('owner');
      var newSearch = params.toString();
      var cleanUrl = window.location.pathname + (newSearch ? '?' + newSearch : '') + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    } else if (owner === 'off') {
      localStorage.removeItem('dch_owner_mode');
      params.delete('owner');
      var newSearch = params.toString();
      var cleanUrl = window.location.pathname + (newSearch ? '?' + newSearch : '') + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    }

    var isOwner = false;
    var savedConsent = null;
    try {
      isOwner = localStorage.getItem('dch_owner_mode') === 'active';
      savedConsent = localStorage.getItem('dch_cookie_consent');
    } catch (e) {}

    // Early suppression for returning visitors and owner mode before tags initialize
    if (isOwner || savedConsent === 'essential') {
      window['ga-disable-G-18Y3LNHDR8'] = true;
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.pauseAdRequests = 1;
    } else if (savedConsent === 'all' && !isOwner) {
      window['ga-disable-G-18Y3LNHDR8'] = false;
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.pauseAdRequests = 0;
    }

    // Google Consent Mode v2 Early Hook:
    // When the subsequent <head> script calls gtag('consent', 'default', ...),
    // automatically sequence the returning visitor's update immediately after default.
    window.dataLayer = window.dataLayer || [];
    var origPush = window.dataLayer.push.bind(window.dataLayer);
    window.dataLayer.push = function() {
      var res = origPush.apply(window.dataLayer, arguments);
      for (var i = 0; i < arguments.length; i++) {
        var item = arguments[i];
        if (item && item[0] === 'consent' && item[1] === 'default') {
          var currentConsent = null;
          var currentOwner = false;
          try {
            currentConsent = localStorage.getItem('dch_cookie_consent');
            currentOwner = localStorage.getItem('dch_owner_mode') === 'active';
          } catch (e) {}

          if (currentOwner || currentConsent === 'essential') {
            origPush(['consent', 'update', {
              'ad_storage': 'denied',
              'analytics_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied'
            }]);
            window.__dch_consent_applied = 'essential';
          } else if (currentConsent === 'all' && !currentOwner) {
            origPush(['consent', 'update', {
              'ad_storage': 'granted',
              'analytics_storage': 'granted',
              'ad_user_data': 'granted',
              'ad_personalization': 'granted'
            }]);
            window.__dch_consent_applied = 'all';
          }
        }
      }
      return res;
    };

    // Unified Consent API available synchronously to all scripts and buttons
    window.DailyCalcHubsConsent = {
      applyConsent: function(choice) {
        try {
          localStorage.setItem('dch_cookie_consent', choice);
        } catch (e) {}

        var isOwnerActive = false;
        try {
          isOwnerActive = localStorage.getItem('dch_owner_mode') === 'active';
        } catch (e) {}

        if (choice === 'essential') {
          window['ga-disable-G-18Y3LNHDR8'] = true;
          window.adsbygoogle = window.adsbygoogle || [];
          window.adsbygoogle.pauseAdRequests = 1;
          if (typeof window.gtag === 'function') {
            window.gtag('consent', 'update', {
              'ad_storage': 'denied',
              'analytics_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied'
            });
          }
          window.__dch_consent_applied = 'essential';
        } else if (choice === 'all') {
          if (!isOwnerActive) {
            window['ga-disable-G-18Y3LNHDR8'] = false;
            window.adsbygoogle = window.adsbygoogle || [];
            window.adsbygoogle.pauseAdRequests = 0;
          }
          if (typeof window.gtag === 'function') {
            window.gtag('consent', 'update', {
              'ad_storage': 'granted',
              'analytics_storage': 'granted',
              'ad_user_data': 'granted',
              'ad_personalization': 'granted'
            });
          }
          window.__dch_consent_applied = 'all';
        }

        var banner = document.getElementById('cookieConsentBanner');
        if (banner) banner.style.display = 'none';
      }
    };

    if (isOwner) {
      window.addEventListener('DOMContentLoaded', function() {
        if (!document.getElementById('dch-owner-mode-badge')) {
          var isArabic = document.documentElement.lang === 'ar' || document.documentElement.dir === 'rtl' || window.location.pathname.indexOf('/ar/') === 0 || window.location.pathname === '/ar';
          var badgeText = isArabic 
            ? '&#128274; \u0648\u0636\u0639 \u0627\u0644\u0645\u0627\u0644\u0643: \u062a\u0645 \u062a\u0639\u0637\u064a\u0644 \u0627\u0644\u062a\u062a\u0628\u0639 \u0648\u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a'
            : '&#128274; Owner Mode: Tracking &amp; Ads Disabled';
          var positioning = isArabic ? 'right:14px;' : 'left:14px;';
          
          var badge = document.createElement('div');
          badge.id = 'dch-owner-mode-badge';
          badge.innerHTML = badgeText;
          badge.style.cssText = 'position:fixed;bottom:14px;' + positioning + 'background:rgba(17,24,39,0.92);color:#10b981;font-size:11.5px;font-weight:600;font-family:system-ui,-apple-system,sans-serif;padding:6px 12px;border-radius:20px;border:1px solid rgba(16,185,129,0.35);box-shadow:0 4px 12px rgba(0,0,0,0.25);z-index:99999;pointer-events:none;letter-spacing:0.2px;backdrop-filter:blur(4px);';
          document.body.appendChild(badge);
        }
      });
    }
  } catch (e) {}
})();
