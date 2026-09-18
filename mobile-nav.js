/**
 * DailyCalcHubs — Dedicated Mobile Navigation Controller
 * Handles mobile hamburger toggle, accessible ARIA states, and outside-click dismissal.
 * Isolated from theme.js and Night Mode.
 */
(function() {
  'use strict';

  function initMobileNav() {
    var menuBtn = document.getElementById('mobileMenuBtn');
    var navContainer = document.getElementById('navContainer') || document.querySelector('.site-header .header-nav-container');

    if (!menuBtn || !navContainer) return;

    // Avoid duplicate initialization
    if (menuBtn.dataset.navInitialized === 'true') return;
    menuBtn.dataset.navInitialized = 'true';

    function openMenu() {
      navContainer.classList.add('open');
      menuBtn.setAttribute('aria-expanded', 'true');
      var icon = menuBtn.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
      }
    }

    function closeMenu() {
      navContainer.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      var icon = menuBtn.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
      }
    }

    menuBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (navContainer.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close when clicking anywhere outside
    document.addEventListener('click', function(e) {
      if (navContainer.classList.contains('open')) {
        if (!navContainer.contains(e.target) && !menuBtn.contains(e.target)) {
          closeMenu();
        }
      }
    });

    // Close on Escape key press
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && navContainer.classList.contains('open')) {
        closeMenu();
      }
    });

    // Close when a nav link is clicked (smoother mobile UX)
    var navLinks = navContainer.querySelectorAll('a');
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function() {
        closeMenu();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNav);
  } else {
    initMobileNav();
  }
})();