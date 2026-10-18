/**
 * DailyCalcHubs â€” Dedicated Navigation Controller
 * Handles desktop Explore Tools dropdown, category tabs, and mobile navigation drawer.
 * Universal across English and Arabic layouts.
 * Includes dynamic hydration of directory tools from shared cached data.
 */
(function() {
  'use strict';

  var DCH_DEFAULT_NAV_DATA = {"version":"1.0","categories":[{"key":"remittance","enTabTitle":"Remittance \u0026 Forex","arTabTitle":"تحويل الأموال والصرف","enTitle":"Remittance \u0026 Forex","arTitle":"تحويل الأموال والصرف","enDesc":"SAR Exchange Rate References, transfer fees \u0026 corridors","arDesc":"أسعار الصرف المرجعية للريال، مقارنة رسوم التحويل والدليل الإرشادي","enHub":"/saudi-remittance-calculator/","arHub":"/ar/saudi-remittance-calculator/","enTools":[{"url":"/saudi-remittance-calculator/live-sar-exchange-rate/","title":"SAR Exchange Rate References"},{"url":"/saudi-remittance-calculator/sar-to-inr/","title":"SAR to INR (India)"},{"url":"/saudi-remittance-calculator/sar-to-pkr/","title":"SAR to PKR (Pakistan)"},{"url":"/saudi-remittance-calculator/sar-to-bdt/","title":"SAR to BDT (Bangladesh)"},{"url":"/saudi-remittance-calculator/sar-to-php/","title":"SAR to PHP (Philippines)"},{"url":"/saudi-remittance-calculator/sar-to-npr/","title":"SAR to NPR (Nepal)"},{"url":"/saudi-remittance-calculator/sar-to-lkr/","title":"SAR to LKR (Sri Lanka)"},{"url":"/saudi-remittance-calculator/remittance-comparison/","title":"Remittance Comparison Tool"},{"url":"/saudi-remittance-calculator/remittance-fee/","title":"Remittance Fee Calculator"},{"url":"/saudi-remittance-calculator/saudi-to-india-remittance-guide/","title":"Saudi to India Remittance Guide"}],"arTools":[{"url":"/ar/saudi-remittance-calculator/live-sar-exchange-rate/","title":"أسعار الصرف المرجعية للريال"},{"url":"/ar/saudi-remittance-calculator/sar-to-inr/","title":"تحويل الريال إلى الروبية الهندية (INR)"},{"url":"/ar/saudi-remittance-calculator/sar-to-pkr/","title":"تحويل الريال إلى الروبية الباكستانية (PKR)"},{"url":"/ar/saudi-remittance-calculator/sar-to-bdt/","title":"تحويل الريال إلى التاكا البنغلاديشية (BDT)"},{"url":"/ar/saudi-remittance-calculator/sar-to-php/","title":"تحويل الريال إلى البيزو الفلبيني (PHP)"},{"url":"/ar/saudi-remittance-calculator/sar-to-npr/","title":"تحويل الريال إلى الروبية النيبالية (NPR)"},{"url":"/ar/saudi-remittance-calculator/sar-to-lkr/","title":"تحويل الريال إلى الروبية السريلانكية (LKR)"},{"url":"/ar/saudi-remittance-calculator/remittance-comparison/","title":"مقارنة رسوم ومنصات تحويل الأموال"},{"url":"/ar/saudi-remittance-calculator/remittance-fee/","title":"حاسبة رسوم التحويل المالي الدولي"},{"url":"/ar/saudi-remittance-calculator/saudi-to-india-remittance-guide/","title":"دليل تحويل الأموال من السعودية إلى الهند"}]},{"key":"prayer","enTabTitle":"Prayer \u0026 Religious","arTabTitle":"مواقيت الصلاة والقبلة","enTitle":"Prayer \u0026 Religious","arTitle":"مواقيت الصلاة والقبلة","enDesc":"Accurate Umm Al-Qura prayer times and Qibla direction","arDesc":"مواقيت الصلاة الدقيقة حسب تقويم أم القرى واتجاه القبلة","enHub":"/prayer-times/","arHub":"/ar/prayer-times/","enTools":[{"url":"/prayer-times/","title":"Umm Al-Qura Prayer Times \u0026 Qibla"}],"arTools":[{"url":"/ar/prayer-times/","title":"مواقيت الصلاة بتقويم أم القرى واتجاه القبلة"}]},{"key":"salary","enTabTitle":"Salary \u0026 Labor Law","arTabTitle":"الرواتب ونظام العمل","enTitle":"Salary \u0026 Labor Law","arTitle":"الرواتب ونظام العمل","enDesc":"EOSB gratuity, wage breakdowns, overtime \u0026 labor rules","arDesc":"مكافأة نهاية الخدمة، صافي الراتب، استقطاع التأمينات والعمل الإضافي","enHub":"/saudi-salary-calculator/","arHub":"/ar/saudi-salary-calculator/","enTools":[{"url":"/saudi-salary-calculator/eosb/","title":"End of Service (EOSB) Gratuity"},{"url":"/saudi-salary-calculator/take-home-salary/","title":"Net Take-Home Salary Calculator"},{"url":"/saudi-salary-calculator/gosi-calculator/","title":"GOSI Contribution Calculator"},{"url":"/saudi-salary-calculator/overtime/","title":"Overtime Calculator (Article 107)"},{"url":"/saudi-salary-calculator/final-settlement/","title":"Final Settlement Calculator"},{"url":"/saudi-salary-calculator/resignation-gratuity/","title":"Resignation Gratuity (Article 85)"},{"url":"/saudi-salary-calculator/basic-salary/","title":"Basic Salary Calculator"},{"url":"/saudi-salary-calculator/salary-allowances/","title":"Salary Allowances Calculator"},{"url":"/saudi-salary-calculator/daily-salary/","title":"Daily Salary Calculator"},{"url":"/saudi-salary-calculator/hourly-salary/","title":"Hourly Salary Calculator"},{"url":"/saudi-salary-calculator/annual-salary/","title":"Annual Salary Calculator"},{"url":"/saudi-salary-calculator/salary-increment/","title":"Salary Increment Calculator"}],"arTools":[{"url":"/ar/saudi-salary-calculator/eosb/","title":"حاسبة مكافأة نهاية الخدمة (EOSB)"},{"url":"/ar/saudi-salary-calculator/take-home-salary/","title":"حاسبة صافي الراتب المستلم"},{"url":"/ar/saudi-salary-calculator/gosi-calculator/","title":"حاسبة التأمينات الاجتماعية (GOSI)"},{"url":"/ar/saudi-salary-calculator/overtime/","title":"حاسبة ساعات العمل الإضافي"},{"url":"/ar/saudi-salary-calculator/final-settlement/","title":"حاسبة تصفية المستحقات النهائية"},{"url":"/ar/saudi-salary-calculator/resignation-gratuity/","title":"حاسبة مكافأة الاستقالة"},{"url":"/ar/saudi-salary-calculator/basic-salary/","title":"حاسبة الراتب الأساسي"},{"url":"/ar/saudi-salary-calculator/salary-allowances/","title":"حاسبة البدلات والمزايا"},{"url":"/ar/saudi-salary-calculator/daily-salary/","title":"حاسبة أجر اليوم وخصم الغياب"},{"url":"/ar/saudi-salary-calculator/hourly-salary/","title":"حاسبة أجر الساعة"},{"url":"/ar/saudi-salary-calculator/annual-salary/","title":"حاسبة الراتب السنوي والدخل الإجمالي"},{"url":"/ar/saudi-salary-calculator/salary-increment/","title":"حاسبة العلاوة وزيادة الراتب"}]},{"key":"iqama","enTabTitle":"Iqama \u0026 Residency","arTabTitle":"الإقامة ورخص العمل","enTitle":"Iqama \u0026 Residency","arTitle":"الإقامة ورخص العمل","enDesc":"Iqama renewal costs, dependent levies \u0026 work permits","arDesc":"رسوم تجديد الإقامة، مقابل المرافقين المالي ورخص العمل","enHub":"/saudi-iqama-calculator/","arHub":"/ar/saudi-iqama-calculator/","enTools":[{"url":"/saudi-iqama-calculator/iqama-cost/","title":"Total Saudi Iqama Cost"},{"url":"/saudi-iqama-calculator/dependent-fee/","title":"Saudi Dependent Fee \u0026 Levy"},{"url":"/saudi-iqama-calculator/family-dependent-cost/","title":"Family Dependent Cost Calculator"},{"url":"/saudi-iqama-calculator/maktab-amal/","title":"Maktab Amal Work Permit Fee"},{"url":"/saudi-iqama-calculator/renewal-fee/","title":"Iqama Renewal Fee Calculator"},{"url":"/saudi-iqama-calculator/renewal-guide/","title":"Complete Iqama Renewal Guide"},{"url":"/saudi-iqama-calculator/work-permit/","title":"Work Permit (Karat Amal) Fee"},{"url":"/saudi-iqama-calculator/?duration=3","title":"3-Month Quarterly Iqama Cost"},{"url":"/saudi-iqama-calculator/?duration=6","title":"6-Month Half-Year Iqama Cost"},{"url":"/saudi-iqama-calculator/?duration=9","title":"9-Month Iqama Cost"},{"url":"/saudi-iqama-calculator/?duration=12","title":"12-Month Annual Iqama Cost"}],"arTools":[{"url":"/ar/saudi-iqama-calculator/iqama-cost/","title":"حاسبة التكلفة الإجمالية للإقامة"},{"url":"/ar/saudi-iqama-calculator/dependent-fee/","title":"حاسبة رسوم المرافقين"},{"url":"/ar/saudi-iqama-calculator/family-dependent-cost/","title":"حاسبة تكلفة إقامة المرافقين والتابعين"},{"url":"/ar/saudi-iqama-calculator/maktab-amal/","title":"حاسبة المقابل المالي لمكتب العمل"},{"url":"/ar/saudi-iqama-calculator/renewal-fee/","title":"حاسبة رسوم تجديد الإقامة"},{"url":"/ar/saudi-iqama-calculator/renewal-guide/","title":"دليل تجديد الإقامة خطوة بخطوة"},{"url":"/ar/saudi-iqama-calculator/work-permit/","title":"حاسبة رسوم رخصة العمل"},{"url":"/ar/saudi-iqama-calculator/?duration=3","title":"حاسبة تجديد الإقامة 3 أشهر"},{"url":"/ar/saudi-iqama-calculator/?duration=6","title":"حاسبة تجديد الإقامة 6 أشهر"},{"url":"/ar/saudi-iqama-calculator/?duration=9","title":"حاسبة تجديد الإقامة 9 أشهر"},{"url":"/ar/saudi-iqama-calculator/?duration=12","title":"تكلفة تجديد الإقامة السنوية 12 شهراً"}]},{"key":"everyday","enTabTitle":"Everyday Smart Tools","arTabTitle":"أدوات الحياة اليومية","enTitle":"Everyday Smart Tools","arTitle":"أدوات الحياة اليومية","enDesc":"Age, discounts, fuel, electricity, BMI, bills \u0026 converters","arDesc":"العمر، الخصومات، الوقود، الكهرباء، مؤشر كتلة الجسم وتقسيم الفواتير","enHub":"/everyday-smart-calculator/","arHub":"/ar/everyday-smart-calculator/","enTools":[{"url":"/everyday-smart-calculator/age-calculator/","title":"Age \u0026 Date of Birth Calculator"},{"url":"/everyday-smart-calculator/discount-calculator/","title":"Smart Discount \u0026 Sale Price"},{"url":"/everyday-smart-calculator/percentage-calculator/","title":"Percentage Calculator (4 Modes)"},{"url":"/everyday-smart-calculator/split-bill-calculator/","title":"Split Bill \u0026 Group Expense"},{"url":"/everyday-smart-calculator/fuel-cost-calculator/","title":"Fuel \u0026 Petrol Cost Calculator"},{"url":"/everyday-smart-calculator/electricity-cost-calculator/","title":"Electricity / Unit Cost Calculator"},{"url":"/everyday-smart-calculator/appliance-electricity-consumption/","title":"Appliance Electricity Consumption"},{"url":"/everyday-smart-calculator/bmi-calculator/","title":"BMI Health Calculator"},{"url":"/everyday-smart-calculator/tip-calculator/","title":"Tip \u0026 Gratuity Calculator"},{"url":"/everyday-smart-calculator/time-duration-calculator/","title":"Time Duration \u0026 Date Difference"},{"url":"/everyday-smart-calculator/gpa-calculator/","title":"GPA / Grade Point Calculator"},{"url":"/everyday-smart-calculator/unit-converter/","title":"Universal Unit Converter"}],"arTools":[{"url":"/ar/everyday-smart-calculator/age-calculator/","title":"حاسبة العمر وتاريخ الميلاد"},{"url":"/ar/everyday-smart-calculator/discount-calculator/","title":"حاسبة الخصم وضريبة القيمة المضافة"},{"url":"/ar/everyday-smart-calculator/percentage-calculator/","title":"حاسبة النسبة المئوية (4 أوضاع)"},{"url":"/ar/everyday-smart-calculator/split-bill-calculator/","title":"حاسبة تقسيم الفاتورة بالتساوي"},{"url":"/ar/everyday-smart-calculator/fuel-cost-calculator/","title":"حاسبة تكلفة استهلاك الوقود"},{"url":"/ar/everyday-smart-calculator/electricity-cost-calculator/","title":"حاسبة فاتورة الكهرباء السعودية"},{"url":"/ar/everyday-smart-calculator/appliance-electricity-consumption/","title":"حاسبة استهلاك الأجهزة للطاقة"},{"url":"/ar/everyday-smart-calculator/bmi-calculator/","title":"حاسبة مؤشر كتلة الجسم (BMI)"},{"url":"/ar/everyday-smart-calculator/tip-calculator/","title":"حاسبة البقشيش والإكرامية"},{"url":"/ar/everyday-smart-calculator/time-duration-calculator/","title":"حاسبة الفترات الزمنية والتواريخ"},{"url":"/ar/everyday-smart-calculator/gpa-calculator/","title":"حاسبة المعدل التراكمي الجامعي (GPA)"},{"url":"/ar/everyday-smart-calculator/unit-converter/","title":"محول الوحدات القياسية الشامل"}]},{"key":"sip","enTabTitle":"Shariah SIP \u0026 Wealth","arTabTitle":"الاستثمار الشرعي (SIP)","enTitle":"Shariah SIP \u0026 Wealth","arTitle":"الاستثمار الشرعي (SIP)","enDesc":"Halal mutual funds, goal planning \u0026 wealth compounding","arDesc":"صناديق الاستثمار المتوافقة مع الشريعة، خطط الأهداف ونمو الثروة","enHub":"/shariah-sip-calculator/","arHub":"/ar/shariah-sip-calculator/","enTools":[{"url":"/shariah-sip-calculator/sip-calculator/","title":"Shariah SIP Calculator"},{"url":"/shariah-sip-calculator/sip-goal-calculator/","title":"Shariah SIP Goal Calculator"},{"url":"/shariah-sip-calculator/monthly-investment-calculator/","title":"Monthly Investment Compounding"},{"url":"/shariah-sip-calculator/lump-sum-calculator/","title":"Lump Sum vs SIP Wealth Projection"}],"arTools":[{"url":"/ar/shariah-sip-calculator/sip-calculator/","title":"حاسبة الاستثمار الشهري التراكمي (SIP)"},{"url":"/ar/shariah-sip-calculator/sip-goal-calculator/","title":"حاسبة تحقيق الهدف المالي الاستثماري"},{"url":"/ar/shariah-sip-calculator/monthly-investment-calculator/","title":"حاسبة الاستثمار الشهري التراكمي"},{"url":"/ar/shariah-sip-calculator/lump-sum-calculator/","title":"حاسبة الاستثمار بمبلغ مقطوع مقابل SIP"}]},{"key":"travel","enTabTitle":"Travel \u0026 Booking","arTabTitle":"السفر وحجوزات الطيران","enTitle":"Travel \u0026 Booking","arTitle":"السفر وحجوزات الطيران","enDesc":"Flight, hotel, travel expense splitter \u0026 trip budgets","arDesc":"تكاليف الطيران، الفنادق، ميزانية الرحلة وتقسيم مصاريف السفر","enHub":"/travel-booking-calculator/","arHub":"/ar/travel-booking-calculator/","enTools":[{"url":"/travel-booking-calculator/flight-cost/","title":"Flight Cost Calculator"},{"url":"/travel-booking-calculator/hotel-cost/","title":"Hotel Cost Calculator"},{"url":"/travel-booking-calculator/expense-split/","title":"Travel Expense Splitter"},{"url":"/travel-booking-calculator/booking-cost/","title":"Booking Cost \u0026 Fee Calculator"},{"url":"/travel-booking-calculator/travel-budget/","title":"Travel Budget Calculator"}],"arTools":[{"url":"/ar/travel-booking-calculator/flight-cost/","title":"حاسبة تكلفة تذاكر الطيران"},{"url":"/ar/travel-booking-calculator/hotel-cost/","title":"حاسبة تكلفة الفنادق والإقامة"},{"url":"/ar/travel-booking-calculator/expense-split/","title":"حاسبة تقسيم مصاريف السفر والرحلات"},{"url":"/ar/travel-booking-calculator/booking-cost/","title":"حاسبة رسوم الحجز والرسوم الإضافية"},{"url":"/ar/travel-booking-calculator/travel-budget/","title":"حاسبة ميزانية السفر الشاملة"}]},{"key":"about","enTabTitle":"About Us","arTabTitle":"من نحن","enTitle":"About Us","arTitle":"من نحن","enDesc":"Company information and legal policies","arDesc":"معلومات الشركة والسياسات القانونية","enHub":"/about/","arHub":"/ar/about/","enTools":[{"url":"/about/","title":"About Us"},{"url":"/contact/","title":"Contact"},{"url":"/disclaimer/","title":"Disclaimer"},{"url":"/privacy-policy/","title":"Privacy Policy"},{"url":"/terms/","title":"Terms of Use"}],"arTools":[{"url":"/ar/about/","title":"من نحن"},{"url":"/ar/contact/","title":"اتصل بنا"},{"url":"/ar/disclaimer/","title":"إخلاء المسؤولية"},{"url":"/ar/privacy-policy/","title":"سياسة الخصوصية"},{"url":"/ar/terms/","title":"شروط الاستخدام"}]}]};
  window.DCH_NAV_DATA = window.DCH_NAV_DATA || DCH_DEFAULT_NAV_DATA;

  function hydrateNavMenu(data) {
    if (!data || !data.categories) return;
    var isAr = (document.documentElement.getAttribute('lang') === 'ar' || (window.location.pathname && window.location.pathname.indexOf('/ar/') === 0));

    data.categories.forEach(function(cat) {
      var tools = isAr ? cat.arTools : cat.enTools;
      if (!tools || tools.length === 0) return;

      // 1. Desktop Mega Panel
      var panel = document.getElementById('panel-' + cat.key);
      if (panel) {
        var grid = panel.querySelector('.mega-panel-tools-grid');
        if (grid && grid.children.length === 0) {
          var frag = document.createDocumentFragment();
          tools.forEach(function(t) {
            var a = document.createElement('a');
            a.href = t.url;
            a.className = 'mega-tool-item';
            a.setAttribute('role', 'menuitem');

            var bullet = document.createElement('span');
            bullet.className = 'mega-tool-bullet';

            var text = document.createElement('span');
            text.className = 'mega-tool-text';
            text.textContent = t.title;

            a.appendChild(bullet);
            a.appendChild(text);
            frag.appendChild(a);
          });
          grid.appendChild(frag);
        }
      }

      // 2. Mobile Accordion Item
      var mobItem = document.querySelector('.mobile-accordion-item[data-cat="' + cat.key + '"]');
      if (!mobItem) {
        var catKeys = ['remittance', 'prayer', 'salary', 'iqama', 'everyday', 'sip', 'travel', 'about'];
        var idx = catKeys.indexOf(cat.key);
        var allMobItems = document.querySelectorAll('.mobile-accordion-item');
        if (idx >= 0 && idx < allMobItems.length && (!allMobItems[idx].hasAttribute('data-cat') || allMobItems[idx].getAttribute('data-cat') === cat.key)) {
          mobItem = allMobItems[idx];
          mobItem.setAttribute('data-cat', cat.key);
        }
      }
      if (mobItem) {
        var list = mobItem.querySelector('.mobile-acc-links-list');
        if (list && list.children.length === 0) {
          var mobFrag = document.createDocumentFragment();
          tools.forEach(function(t) {
            var a = document.createElement('a');
            a.href = t.url;
            a.className = 'mobile-acc-tool-link';
            a.textContent = t.title;
            mobFrag.appendChild(a);
          });
          list.appendChild(mobFrag);
        }
      }
    });
  }

  // Background fetch to update cached navigation data if updated
  function fetchRemoteNavData() {
    if (typeof fetch !== 'function') return;
    try {
      var cached = sessionStorage.getItem('dch_nav_data_v1');
      if (cached) {
        window.DCH_NAV_DATA = JSON.parse(cached);
        hydrateNavMenu(window.DCH_NAV_DATA);
        return;
      }
    } catch (e) {}

    fetch('/navigation-data.json')
      .then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function(data) {
        if (data && data.categories) {
          window.DCH_NAV_DATA = data;
          hydrateNavMenu(data);
          try {
            sessionStorage.setItem('dch_nav_data_v1', JSON.stringify(data));
          } catch (e) {}
        }
      })
      .catch(function() {
        // Fallback already hydrated synchronously
      });
  }

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
        syncActiveCategory();
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

    // Synchronize active mobile category & About Us state
    function syncActiveCategory() {
      var rawPath = window.location.pathname || '';
      var cleanPath = (rawPath.replace(/\/index\.html$/i, '').replace(/\/+$/, '') || '/').toLowerCase();

      var accItems = document.querySelectorAll('.mobile-accordion-item');
      if (!accItems || accItems.length === 0) return;

      // 1. Guard against highlighting on homepage ('/' or '/ar')
      if (cleanPath === '/' || cleanPath === '/ar') {
        accItems.forEach(function(item) {
          item.classList.remove('active');
          var btn = item.querySelector('.mobile-accordion-header');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
        return;
      }

      var categoryRoots = [
        'saudi-remittance-calculator',
        'prayer-times',
        'saudi-salary-calculator',
        'saudi-iqama-calculator',
        'everyday-smart-calculator',
        'shariah-sip-calculator',
        'travel-booking-calculator'
      ];

      var aboutPages = [
        '/about',
        '/contact',
        '/disclaimer',
        '/privacy-policy',
        '/terms',
        '/ar/about',
        '/ar/contact',
        '/ar/disclaimer',
        '/ar/privacy-policy',
        '/ar/terms'
      ];

      var isAboutPage = aboutPages.indexOf(cleanPath) !== -1;
      var targetItem = null;

      if (isAboutPage) {
        // Target 8: About Us
        for (var i = 0; i < accItems.length; i++) {
          var aboutLink = accItems[i].querySelector('a[href="/about/"], a[href="/ar/about/"]');
          if (aboutLink) {
            targetItem = accItems[i];
            break;
          }
        }
      } else {
        // Targets 1 to 7: Tool Categories
        var matchedSlug = null;
        for (var c = 0; c < categoryRoots.length; c++) {
          var slug = categoryRoots[c];
          if (cleanPath === '/' + slug || cleanPath.indexOf('/' + slug + '/') === 0 ||
              cleanPath === '/ar/' + slug || cleanPath.indexOf('/ar/' + slug + '/') === 0) {
            matchedSlug = slug;
            break;
          }
        }

        if (matchedSlug) {
          for (var j = 0; j < accItems.length; j++) {
            var toolLink = accItems[j].querySelector('a[href*="/' + matchedSlug + '/"]');
            if (toolLink) {
              targetItem = accItems[j];
              break;
            }
          }
        }
      }

      // Synchronize accordion item active state across all items
      accItems.forEach(function(item) {
        if (targetItem && item === targetItem) {
          item.classList.add('active');
          var btn = item.querySelector('.mobile-accordion-header');
          if (btn) btn.setAttribute('aria-expanded', 'true');
        } else {
          item.classList.remove('active');
          var otherBtn = item.querySelector('.mobile-accordion-header');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });
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

    syncActiveCategory();
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
    hydrateNavMenu(window.DCH_NAV_DATA);
    initExploreDropdown();
    initCategoryDropdown();
    initAboutUsDropdown();
    initMobileNav();
    fetchRemoteNavData();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();