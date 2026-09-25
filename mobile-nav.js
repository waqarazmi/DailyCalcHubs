/**
 * DailyCalcHubs — Dedicated Navigation Controller
 * Handles desktop Explore Tools dropdown, category tabs, and mobile navigation drawer.
 * Universal across English and Arabic layouts.
 */
(function() {
  'use strict';

  function initExploreDropdown() {
    var exploreBtn = document.getElementById('exploreToolsBtn');
    var exploreDropdown = document.getElementById('exploreToolsDropdown');
    var catTabs = document.querySelectorAll('.mega-cat-tab');
    var catPanels = document.querySelectorAll('.mega-category-panel');

    if (exploreBtn && exploreDropdown) {
      if (exploreBtn.dataset.exploreInitialized === 'true') return;
      exploreBtn.dataset.exploreInitialized = 'true';

      exploreBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var isOpen = exploreDropdown.classList.contains('active');
        exploreDropdown.classList.toggle('active', !isOpen);
        exploreBtn.setAttribute('aria-expanded', String(!isOpen));
      });

      document.addEventListener('click', function(e) {
        if (!exploreDropdown.contains(e.target)) {
          exploreDropdown.classList.remove('active');
          exploreBtn.setAttribute('aria-expanded', 'false');
        }
      });

      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          exploreDropdown.classList.remove('active');
          exploreBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    if (catTabs.length > 0 && catPanels.length > 0) {
      function switchCategory(catId) {
        catTabs.forEach(function(tab) {
          var isTarget = tab.getAttribute('data-cat') === catId;
          tab.classList.toggle('active', isTarget);
          tab.setAttribute('aria-selected', String(isTarget));
          tab.setAttribute('tabindex', isTarget ? '0' : '-1');
        });

        catPanels.forEach(function(panel) {
          var isTarget = panel.id === 'panel-' + catId;
          panel.classList.toggle('active', isTarget);
        });
      }

      catTabs.forEach(function(tab, index) {
        tab.addEventListener('mouseenter', function() {
          var catId = this.getAttribute('data-cat');
          switchCategory(catId);
        });

        tab.addEventListener('click', function(e) {
          e.preventDefault();
          var catId = this.getAttribute('data-cat');
          switchCategory(catId);
        });

        tab.addEventListener('keydown', function(e) {
          var targetTab = null;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            targetTab = catTabs[(index + 1) % catTabs.length];
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            targetTab = catTabs[(index - 1 + catTabs.length) % catTabs.length];
          } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            var activePanel = document.querySelector('.mega-category-panel.active');
            if (activePanel) {
              var firstLink = activePanel.querySelector('.mega-tool-item');
              if (firstLink) {
                e.preventDefault();
                firstLink.focus();
              }
            }
          }
          if (targetTab) {
            targetTab.focus();
            switchCategory(targetTab.getAttribute('data-cat'));
          }
        });
      });
    }
  }

  function initMobileNav() {
    var menuBtn = document.getElementById('mobileMenuBtn');
    var navContainer = document.getElementById('navContainer') || document.querySelector('.site-header .header-nav-container');

    if (menuBtn) {
      if (menuBtn.dataset.navInitialized === 'true') return;
      menuBtn.dataset.navInitialized = 'true';

      var drawer = navContainer ? navContainer.querySelector('.mobile-nav-drawer') : null;
      var closeBtn = document.getElementById('mobileNavCloseBtn');
      var backdrop = document.getElementById('mobileNavBackdrop');

      function openMenu() {
        if (navContainer) navContainer.classList.add('open');
        if (drawer) drawer.classList.add('open');
        menuBtn.setAttribute('aria-expanded', 'true');
        var icon = menuBtn.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-xmark');
        }
      }

      function closeMenu() {
        if (navContainer) navContainer.classList.remove('open');
        if (drawer) drawer.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        var icon = menuBtn.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      }

      menuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (navContainer && navContainer.classList.contains('open')) {
          closeMenu();
        } else {
          openMenu();
        }
      });

      if (closeBtn) closeBtn.addEventListener('click', closeMenu);
      if (backdrop) backdrop.addEventListener('click', closeMenu);

      document.addEventListener('click', function(e) {
        if (navContainer && navContainer.classList.contains('open')) {
          if (!navContainer.contains(e.target) && !menuBtn.contains(e.target)) {
            closeMenu();
          }
        }
      });

      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navContainer && navContainer.classList.contains('open')) {
          closeMenu();
        }
      });

      if (navContainer) {
        var navLinks = navContainer.querySelectorAll('a');
        for (var i = 0; i < navLinks.length; i++) {
          navLinks[i].addEventListener('click', function() {
            closeMenu();
          });
        }
      }
    }

    // Mobile Accordion Items
    var accHeaders = document.querySelectorAll('.mobile-accordion-header');
    accHeaders.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var item = this.closest('.mobile-accordion-item');
        if (!item) return;
        var wasActive = item.classList.contains('active');

        document.querySelectorAll('.mobile-accordion-item').forEach(function(other) {
          other.classList.remove('active');
          var otherBtn = other.querySelector('.mobile-accordion-header');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        });

        if (!wasActive) {
          item.classList.add('active');
          this.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  // Global helper for inline clicks
  window.closeExploreDropdown = function() {
    var exploreDropdown = document.getElementById('exploreToolsDropdown');
    var exploreBtn = document.getElementById('exploreToolsBtn');
    if (exploreDropdown) exploreDropdown.classList.remove('active');
    if (exploreBtn) exploreBtn.setAttribute('aria-expanded', 'false');
  };

  function initAll() {
    initExploreDropdown();
    initMobileNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();