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
        var catDropdown = document.getElementById('currentCategoryDropdown');
        var catBtn = document.getElementById('currentCategoryBtn');
        if (catDropdown) {
          catDropdown.classList.remove('active');
          if (catBtn) catBtn.setAttribute('aria-expanded', 'false');
        }
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

  function initCategoryDropdown() {
    var catBtn = document.getElementById('currentCategoryBtn');
    var catDropdown = document.getElementById('currentCategoryDropdown');
    var exploreDropdown = document.getElementById('exploreToolsDropdown');
    var exploreBtn = document.getElementById('exploreToolsBtn');

    if (catBtn && catDropdown) {
      if (catBtn.dataset.catInitialized === 'true') return;
      catBtn.dataset.catInitialized = 'true';

      catBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (exploreDropdown) {
          exploreDropdown.classList.remove('active');
          if (exploreBtn) exploreBtn.setAttribute('aria-expanded', 'false');
        }
        var isOpen = catDropdown.classList.contains('active');
        catDropdown.classList.toggle('active', !isOpen);
        catBtn.setAttribute('aria-expanded', String(!isOpen));
      });

      document.addEventListener('click', function(e) {
        if (!catDropdown.contains(e.target)) {
          catDropdown.classList.remove('active');
          catBtn.setAttribute('aria-expanded', 'false');
        }
      });

      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          catDropdown.classList.remove('active');
          catBtn.setAttribute('aria-expanded', 'false');
        }
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

      // Initialize Theme Toggle in Mobile Drawer Header if not already in markup
      var drawerThemeBtn = document.getElementById('mobileDrawerThemeToggle');
      if (!drawerThemeBtn && drawer && closeBtn) {
        var header = drawer.querySelector('.mobile-nav-header');
        if (header) {
          var headerActions = drawer.querySelector('.mobile-header-actions');
          if (!headerActions) {
            headerActions = document.createElement('div');
            headerActions.className = 'mobile-header-actions';
            closeBtn.parentNode.insertBefore(headerActions, closeBtn);
            headerActions.appendChild(closeBtn);
          }
          drawerThemeBtn = document.createElement('button');
          drawerThemeBtn.type = 'button';
          drawerThemeBtn.id = 'mobileDrawerThemeToggle';
          drawerThemeBtn.className = 'mobile-theme-toggle dch-theme-toggle';
          var isAr = document.documentElement.getAttribute('lang') === 'ar';
          var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
          drawerThemeBtn.setAttribute('aria-label', isAr ? 'تبديل المظهر' : 'Toggle theme');
          drawerThemeBtn.setAttribute('title', isAr ? 'تبديل المظهر' : 'Toggle theme');
          drawerThemeBtn.innerHTML = '<i class="' + (isDark ? 'fas fa-sun' : 'fas fa-moon') + '"></i>';
          headerActions.insertBefore(drawerThemeBtn, closeBtn);
        }
      }

      // Sync drawer theme toggle icon on theme changes
      function updateDrawerThemeIcon() {
        var btn = document.getElementById('mobileDrawerThemeToggle');
        if (btn) {
          var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
          var isAr = document.documentElement.getAttribute('lang') === 'ar';
          var icon = btn.querySelector('i');
          if (icon) {
            icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
          }
          var lbl = isAr ? (isDark ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي') : (isDark ? 'Switch to light mode' : 'Switch to dark mode');
          btn.setAttribute('aria-label', lbl);
          btn.setAttribute('title', lbl);
        }
      }

      function openMenu() {
        if (navContainer) {
          navContainer.classList.add('open', 'active');
        }
        if (drawer) {
          drawer.classList.add('open', 'active');
        }
        if (backdrop) {
          backdrop.classList.add('open', 'active');
        }
        document.body.classList.add('mobile-nav-open');
        menuBtn.setAttribute('aria-expanded', 'true');
        var icon = menuBtn.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-xmark');
        }

        // Hide Owner Mode badge over drawer
        var ownerBadge = document.getElementById('dch-owner-mode-badge');
        if (ownerBadge) {
          ownerBadge.style.display = 'none';
        }

        updateDrawerThemeIcon();
      }

      function closeMenu() {
        if (navContainer) {
          navContainer.classList.remove('open', 'active');
        }
        if (drawer) {
          drawer.classList.remove('open', 'active');
        }
        if (backdrop) {
          backdrop.classList.remove('open', 'active');
        }
        document.body.classList.remove('mobile-nav-open');
        menuBtn.setAttribute('aria-expanded', 'false');
        var icon = menuBtn.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }

        // Restore Owner Mode badge if active
        try {
          if (localStorage.getItem('dch_owner_mode') === 'active') {
            var ownerBadge = document.getElementById('dch-owner-mode-badge');
            if (ownerBadge) {
              ownerBadge.style.display = 'block';
            }
          }
        } catch (e) {}
      }

      menuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (navContainer && (navContainer.classList.contains('open') || navContainer.classList.contains('active'))) {
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
        var terminalLinks = navContainer.querySelectorAll('.mobile-acc-tool-link, .mobile-acc-hub-link, .nav-link-item, .lang-switch-btn');
        terminalLinks.forEach(function(link) {
          link.addEventListener('click', function() {
            closeMenu();
          });
        });
      }
    }

    // Mobile Accordion Items
    var accHeaders = document.querySelectorAll('.mobile-accordion-header');
    accHeaders.forEach(function(btn) {
      if (btn.dataset.accInitialized === 'true') return;
      btn.dataset.accInitialized = 'true';

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
    var catDropdown = document.getElementById('currentCategoryDropdown');
    var catBtn = document.getElementById('currentCategoryBtn');
    if (catDropdown) catDropdown.classList.remove('active');
    if (catBtn) catBtn.setAttribute('aria-expanded', 'false');
  };

  function initAboutUsDropdown() {
    var aboutDropdown = document.getElementById('aboutUsDropdown');
    if (!aboutDropdown) return;

    var aboutBtn = aboutDropdown.querySelector('.nav-dropdown-btn');
    if (aboutBtn) {
      if (aboutBtn.dataset.aboutInitialized === 'true') return;
      aboutBtn.dataset.aboutInitialized = 'true';

      aboutBtn.addEventListener('click', function(e) {
        e.stopPropagation();

        var exploreDropdown = document.getElementById('exploreToolsDropdown');
        var exploreBtn = document.getElementById('exploreToolsBtn');
        if (exploreDropdown) {
          exploreDropdown.classList.remove('active');
          if (exploreBtn) exploreBtn.setAttribute('aria-expanded', 'false');
        }

        var catDropdown = document.getElementById('currentCategoryDropdown');
        var catBtn = document.getElementById('currentCategoryBtn');
        if (catDropdown) {
          catDropdown.classList.remove('active');
          if (catBtn) catBtn.setAttribute('aria-expanded', 'false');
        }

        var isOpen = aboutDropdown.classList.contains('active');
        aboutDropdown.classList.toggle('active', !isOpen);
        aboutBtn.setAttribute('aria-expanded', String(!isOpen));
      });

      document.addEventListener('click', function(e) {
        if (!aboutDropdown.contains(e.target)) {
          aboutDropdown.classList.remove('active');
          aboutBtn.setAttribute('aria-expanded', 'false');
        }
      });

      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          aboutDropdown.classList.remove('active');
          aboutBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  function initAll() {
    initExploreDropdown();
    initCategoryDropdown();
    initAboutUsDropdown();
    initMobileNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();