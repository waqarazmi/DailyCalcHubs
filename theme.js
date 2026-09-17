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
    var buttons = document.querySelectorAll('#dchThemeToggle, .dch-theme-toggle');

    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('title', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');

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
})();
