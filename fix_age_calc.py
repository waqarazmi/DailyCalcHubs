import re
import os

def update_file(filepath, is_ar=False):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. HTML Replacements
    # Birth Date
    pattern_birth = r'<div class="input-with-addons">\s*<span class="input-addon-badge"><i class="fas fa-calendar-day"></i></span>\s*<input type="date" id="birthDate"[^>]+>\s*</div>'
    
    attr_dir = ' dir="ltr" inputmode="decimal"' if is_ar else ''
    
    replace_birth = f'''<div class="input-with-addons date-input-group" id="groupBirthDate">
              <button type="button" class="input-addon-badge date-picker-trigger" id="btnBirthDatePicker" aria-label="Open Calendar">
                <i class="fas fa-calendar-day"></i>
              </button>
              <div class="date-input-wrap">
                <input type="date" id="birthDate" class="calc-input native-date-input" value="1998-05-20" required onchange="calculateDetailedAge()"{attr_dir}>
                <input type="text" id="birthDateMobile" class="calc-input mobile-date-input" inputmode="numeric" placeholder="DD-MM-YYYY" maxlength="10" autocomplete="off" spellcheck="false" aria-label="Date of Birth (DD-MM-YYYY)"{attr_dir}>
              </div>
            </div>'''
            
    content = re.sub(pattern_birth, replace_birth, content)

    # Target Date
    pattern_target = r'<div class="input-with-addons">\s*<span class="input-addon-badge"><i class="fas fa-clock"></i></span>\s*<input type="date" id="targetDate"[^>]+>\s*</div>'
    
    replace_target = f'''<div class="input-with-addons date-input-group" id="groupTargetDate">
              <button type="button" class="input-addon-badge date-picker-trigger" id="btnTargetDatePicker" aria-label="Open Calendar">
                <i class="fas fa-clock"></i>
              </button>
              <div class="date-input-wrap">
                <input type="date" id="targetDate" class="calc-input native-date-input" onchange="calculateDetailedAge()"{attr_dir}>
                <input type="text" id="targetDateMobile" class="calc-input mobile-date-input" inputmode="numeric" placeholder="DD-MM-YYYY" maxlength="10" autocomplete="off" spellcheck="false" aria-label="Target Date (DD-MM-YYYY)"{attr_dir}>
              </div>
            </div>'''
            
    content = re.sub(pattern_target, replace_target, content)

    # 2. CSS Injection
    css_injection = '''
    .date-input-wrap { position: relative; flex: 1; display: flex; align-items: center; min-width: 0; width: 100%; }
    .date-picker-trigger {
      background: transparent;
      border: none;
      padding: 0;
      outline: none;
      pointer-events: auto !important;
      cursor: pointer;
      z-index: 2;
    }
    
    @media (max-width: 640px) {
      .date-input-group { position: relative; }
      .native-date-input {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        height: 100% !important;
        opacity: 0 !important;
        z-index: -1 !important;
        pointer-events: none !important;
      }
      .mobile-date-input {
        display: block !important;
        width: 100% !important;
      }
    }

    @media (min-width: 641px) {
      .native-date-input {
        position: static !important;
        opacity: 1 !important;
        width: 100% !important;
        display: block !important;
      }
      .mobile-date-input {
        display: none !important;
      }
      .date-picker-trigger {
        pointer-events: none !important;
        cursor: default !important;
      }
    }
  </style>'''

    content = content.replace('  </style>', css_injection)

    # 3. JS Sync Logic Injection
    js_logic = '''    function isoToDisplay(isoStr) {
      if (!isoStr || typeof isoStr !== 'string') return '';
      const parts = isoStr.split('-');
      if (parts.length !== 3) return '';
      return parts[2] + '-' + parts[1] + '-' + parts[0];
    }

    function isLeapYear(y) {
      return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
    }

    function parseAndValidateDDMMYYYY(str) {
      if (!str || typeof str !== 'string') return null;
      const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(str.trim());
      if (!m) return null;

      const day = parseInt(m[1], 10);
      const month = parseInt(m[2], 10);
      const year = parseInt(m[3], 10);

      if (month < 1 || month > 12) return null;
      if (year < 1900 || year > 2100) return null;

      const isLeap = isLeapYear(year);
      const daysInMonth = [31, (isLeap ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

      if (day < 1 || day > daysInMonth[month - 1]) return null;

      return year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    }

    function setupMobileDateSync(canonicalId, mobileId, btnId) {
      const canonicalEl = document.getElementById(canonicalId);
      const mobileEl = document.getElementById(mobileId);
      const btnEl = document.getElementById(btnId);
      if (!canonicalEl || !mobileEl) return;

      if (canonicalEl.value) {
        mobileEl.value = isoToDisplay(canonicalEl.value);
      }

      function handleCanonicalChange() {
        if (canonicalEl.value) {
          mobileEl.value = isoToDisplay(canonicalEl.value);
        } else {
          mobileEl.value = '';
        }
        calculateDetailedAge();
      }
      canonicalEl.addEventListener('change', handleCanonicalChange);
      canonicalEl.addEventListener('input', handleCanonicalChange);

      if (btnEl) {
        btnEl.addEventListener('click', function(e) {
          e.preventDefault();
          if (typeof canonicalEl.showPicker === 'function') {
            try {
              canonicalEl.showPicker();
              return;
            } catch (err) {}
          }
          canonicalEl.focus();
          canonicalEl.click();
        });
      }

      let lastVal = mobileEl.value;
      mobileEl.addEventListener('input', function(e) {
        let val = mobileEl.value;
        val = val.replace(/[^\d-]/g, '');
        const isDeleting = e.inputType === 'deleteContentBackward' || e.inputType === 'deleteContentForward';
        if (!isDeleting && val.length > lastVal.length) {
          const digits = val.replace(/\D/g, '');
          if (digits.length >= 4) {
            val = digits.slice(0, 2) + '-' + digits.slice(2, 4) + '-' + digits.slice(4, 8);
          } else if (digits.length >= 2) {
            val = digits.slice(0, 2) + '-' + digits.slice(2);
          }
        }
        mobileEl.value = val;
        lastVal = val;

        const errorEl = document.getElementById('ageValidationAlert');
        const alertMsg = document.getElementById('ageAlertMsg');
        
        if (!val) {
          canonicalEl.value = '';
          calculateDetailedAge();
          return;
        }

        if (val.length === 10) {
          const iso = parseAndValidateDDMMYYYY(val);
          if (iso) {
            canonicalEl.value = iso;
            calculateDetailedAge();
          } else {
            canonicalEl.value = '';
            if (errorEl) {
              alertMsg.innerText = "Please enter a valid calendar date in DD-MM-YYYY format.";
              errorEl.style.display = 'block';
            }
          }
        } else {
          canonicalEl.value = '';
          calculateDetailedAge();
        }
      });

      mobileEl.addEventListener('blur', function() {
        const val = mobileEl.value.trim();
        const errorEl = document.getElementById('ageValidationAlert');
        const alertMsg = document.getElementById('ageAlertMsg');
        
        if (!val) {
          canonicalEl.value = '';
          calculateDetailedAge();
          return;
        }
        
        if (val.length < 10) {
          canonicalEl.value = '';
          if (errorEl) {
            alertMsg.innerText = "Incomplete date. Please enter DD-MM-YYYY.";
            errorEl.style.display = 'block';
          }
        } else {
          const iso = parseAndValidateDDMMYYYY(val);
          if (!iso) {
            canonicalEl.value = '';
            if (errorEl) {
              alertMsg.innerText = "Please enter a valid calendar date in DD-MM-YYYY format.";
              errorEl.style.display = 'block';
            }
          }
        }
      });
    }

    function initMobileDateSync() {
      setupMobileDateSync('birthDate', 'birthDateMobile', 'btnBirthDatePicker');
      setupMobileDateSync('targetDate', 'targetDateMobile', 'btnTargetDatePicker');
    }

    function setDobPreset'''

    if is_ar:
        js_logic = js_logic.replace('Please enter a valid calendar date in DD-MM-YYYY format.', 'الرجاء إدخال تاريخ صحيح بصيغة يوم-شهر-سنة (DD-MM-YYYY).')
        js_logic = js_logic.replace('Incomplete date. Please enter DD-MM-YYYY.', 'تاريخ غير مكتمل. الرجاء الإدخال بصيغة يوم-شهر-سنة.')
        
    content = content.replace('    function setDobPreset', js_logic)

    # 4. Modify programmatic assignments
    content = content.replace("document.getElementById('birthDate').value = targetYear + '-' + m + '-' + d;\n        calculateDetailedAge();", "document.getElementById('birthDate').value = targetYear + '-' + m + '-' + d;\n        document.getElementById('birthDate').dispatchEvent(new Event('change'));\n        calculateDetailedAge();")
    
    content = content.replace("document.getElementById('targetDate').value = todayStr;\n      calculateDetailedAge();", "document.getElementById('targetDate').value = todayStr;\n      document.getElementById('targetDate').dispatchEvent(new Event('change'));\n      calculateDetailedAge();")
    
    content = content.replace("document.getElementById('targetDate').dispatchEvent(new Event('change'));\n      calculateDetailedAge();\n    });", "document.getElementById('targetDate').dispatchEvent(new Event('change'));\n      initMobileDateSync();\n      calculateDetailedAge();\n    });")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

update_file('everyday-smart-calculator/age-calculator/index.html', is_ar=False)
update_file('ar/everyday-smart-calculator/age-calculator/index.html', is_ar=True)
print("Updated successfully")
