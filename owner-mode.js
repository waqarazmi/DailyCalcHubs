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

    if (localStorage.getItem('dch_owner_mode') === 'active') {
      window['ga-disable-G-18Y3LNHDR8'] = true;
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.pauseAdRequests = 1;

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
