
  <!-- ======================================================== -->
  <script>
    document.addEventListener('DOMContentLoaded', function() {


      // FAQ accordion
      const faqQuestions = document.querySelectorAll('.faq-question');
      faqQuestions.forEach(q => {
        q.addEventListener('click', () => {
          const ans = q.nextElementSibling;
          const icon = q.querySelector('i');
          if (ans.style.display === 'block') {
            ans.style.display = 'none';
            if (icon) icon.className = 'fas fa-chevron-down';
          } else {
            ans.style.display = 'block';
            if (icon) icon.className = 'fas fa-chevron-up';
          }
        });
      });
    });

    // ==========================================
    // PRAYER TIMES & AUTO-LOCATION ENGINE
    // ==========================================
    const IS_ARABIC = false;
    const STORAGE_KEY = 'dch_prayer_location';

    let prayerSchedule = null;
    let hasCommittedPrayerSchedule = false;
    let currentCityLabel = 'Riyadh, Saudi Arabia';
    let currentLatitude = 24.7136;
    let currentLongitude = 46.6753;
    let currentTimezone = 'Asia/Riyadh';
    let currentLocationSource = 'default';
    let activePrayerRequestId = 0;
    let lastFetchedDateString = '';

    const QUICK_CITIES = {
      makkah:    { lat: 21.4225, lng: 39.8262, en: 'Makkah, Saudi Arabia', ar: 'مكة المكرمة، السعودية', tz: 'Asia/Riyadh' },
      madinah:   { lat: 24.4672, lng: 39.6111, en: 'Madinah, Saudi Arabia', ar: 'المدينة المنورة، السعودية', tz: 'Asia/Riyadh' },
      riyadh:    { lat: 24.7136, lng: 46.6753, en: 'Riyadh, Saudi Arabia', ar: 'الرياض، السعودية', tz: 'Asia/Riyadh' },
      jeddah:    { lat: 21.5433, lng: 39.1728, en: 'Jeddah, Saudi Arabia', ar: 'جدة، السعودية', tz: 'Asia/Riyadh' },
      dammam:    { lat: 26.4207, lng: 50.0888, en: 'Dammam, Saudi Arabia', ar: 'الدمام، السعودية', tz: 'Asia/Riyadh' },
      khobar:    { lat: 26.2818, lng: 50.2084, en: 'Al Khobar, Saudi Arabia', ar: 'الخبر، السعودية', tz: 'Asia/Riyadh' },
      dubai:     { lat: 25.2048, lng: 55.2708, en: 'Dubai, UAE', ar: 'دبي، الإمارات', tz: 'Asia/Dubai' },
      azamgarh:  { lat: 26.0688, lng: 83.1859, en: 'Azamgarh, India', ar: 'أعظم كره، الهند', tz: 'Asia/Kolkata' },
      lucknow:   { lat: 26.8467, lng: 80.9462, en: 'Lucknow, India', ar: 'لكهنؤ، الهند', tz: 'Asia/Kolkata' },
      delhi:     { lat: 28.6139, lng: 77.2090, en: 'Delhi, India', ar: 'دلهي، الهند', tz: 'Asia/Kolkata' },
      mumbai:    { lat: 19.0760, lng: 72.8777, en: 'Mumbai, India', ar: 'مومباي، الهند', tz: 'Asia/Kolkata' },
      hyderabad: { lat: 17.3850, lng: 78.4867, en: 'Hyderabad, India', ar: 'حيدر أباد، الهند', tz: 'Asia/Kolkata' },
      kolkata:   { lat: 22.5726, lng: 88.3639, en: 'Kolkata, India', ar: 'كولكاتا، الهند', tz: 'Asia/Kolkata' },
      bangalore: { lat: 12.9716, lng: 77.5946, en: 'Bangalore, India', ar: 'بنغالور، الهند', tz: 'Asia/Kolkata' }
    };

    const defaultPrayerMap = {
      riyadh: { fajr: '04:20', sunrise: '05:39', ishraq: '05:57', chasht: '08:35', dhuhr: '11:56', asr: '15:24', maghrib: '18:12', isha: '19:42', label: 'Riyadh, Saudi Arabia' },
      dammam: { fajr: '04:12', sunrise: '05:31', ishraq: '05:49', chasht: '08:30', dhuhr: '11:48', asr: '15:18', maghrib: '18:05', isha: '19:35', label: 'Dammam, Saudi Arabia' },
      jeddah: { fajr: '04:45', sunrise: '06:03', ishraq: '06:21', chasht: '08:50', dhuhr: '12:21', asr: '15:46', maghrib: '18:38', isha: '20:08', label: 'Jeddah, Saudi Arabia' },
      dubai:  { fajr: '04:36', sunrise: '05:54', ishraq: '06:12', chasht: '08:45', dhuhr: '12:15', asr: '15:44', maghrib: '18:35', isha: '19:55', label: 'Dubai, UAE' }
    };

    const AUTO_LOCATION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours freshness TTL

    function getStoredLocation() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (data && typeof data.lat === 'number' && typeof data.lng === 'number' && isFinite(data.lat) && isFinite(data.lng)) {
          const isManual = (data.source === 'manual');
          const ts = typeof data.timestamp === 'number' ? data.timestamp : 0;
          const isFresh = isManual || (ts > 0 && (Date.now() - ts) < AUTO_LOCATION_MAX_AGE_MS);
          return {
            lat: data.lat,
            lng: data.lng,
            label: data.label,
            timezone: data.timezone || 'Asia/Riyadh',
            source: data.source || (isManual ? 'manual' : 'default'),
            sourceTag: data.sourceTag || null,
            timestamp: ts,
            isFresh: isFresh,
            isManual: isManual,
            schedule: data.schedule || null,
            weather: data.weather || null
          };
        }
      } catch (e) {}
      return null;
    }

    function saveLocationToStorage(locData) {
      try {
        let existing = {};
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) existing = JSON.parse(raw) || {};
        } catch (err) {}
        const merged = Object.assign({}, existing, locData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch (e) {}
    }

    function findMatchingCityKey(lat, lng) {
      for (const k in QUICK_CITIES) {
        const c = QUICK_CITIES[k];
        if (Math.abs(c.lat - lat) < 0.05 && Math.abs(c.lng - lng) < 0.05) {
          return k;
        }
      }
      return null;
    }

    function highlightCityButton(matchKey) {
      document.querySelectorAll('.city-btn').forEach(b => {
        const oc = b.getAttribute('onclick') || '';
        if (matchKey && oc.includes("'" + matchKey + "'")) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
    }

    function formatTime12h(timeStr) {
      if (!timeStr) return '--:-- --';
      const clean = timeStr.split(' ')[0];
      const parts = clean.split(':');
      if (parts.length < 2) return timeStr;
      let h = parseInt(parts[0], 10);
      const m = parts[1];
      const ampm = IS_ARABIC ? (h >= 12 ? 'م' : 'ص') : (h >= 12 ? 'PM' : 'AM');
      h = h % 12;
      h = h ? h : 12;
      return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
    }

    function addMinutesToTime(timeStr, minsToAdd) {
      if (!timeStr) return '';
      const clean = timeStr.split(' ')[0];
      const parts = clean.split(':');
      let totalMins = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10) + minsToAdd;
      totalMins = (totalMins + 1440) % 1440;
      const h = Math.floor(totalMins / 60);
      const m = totalMins % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    function getMidpointTime(time1, time2) {
      try {
        const p1 = time1.split(' ')[0].split(':');
        const p2 = time2.split(' ')[0].split(':');
        const m1 = parseInt(p1[0], 10) * 60 + parseInt(p1[1], 10);
        const m2 = parseInt(p2[0], 10) * 60 + parseInt(p2[1], 10);
        const mid = Math.round(m1 + (m2 - m1) / 2);
        const h = Math.floor(mid / 60);
        const m = mid % 60;
        return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
      } catch (e) {
        return '08:35';
      }
    }

    function getNowInTimezone(tz) {
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: false
        });
        const parts = formatter.formatToParts(new Date());
        let h = 0, m = 0, s = 0;
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          if (p.type === 'hour') h = parseInt(p.value, 10);
          if (p.type === 'minute') m = parseInt(p.value, 10);
          if (p.type === 'second') s = parseInt(p.value, 10);
        }
        if (h === 24) h = 0;
        return { hours: h, minutes: m, seconds: s, totalSeconds: h * 3600 + m * 60 + s };
      } catch (e) {
        const now = new Date();
        const h = now.getHours();
        const m = now.getMinutes();
        const s = now.getSeconds();
        return { hours: h, minutes: m, seconds: s, totalSeconds: h * 3600 + m * 60 + s };
      }
    }

    function getTargetDateString(tz) {
      try {
        const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: tz });
        return formatter.format(new Date());
      } catch (e) {
        const d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      }
    }

    function getDynamicHijriFallback(isAr, tz) {
      try {
        const f = new Intl.DateTimeFormat(isAr ? 'ar-SA-u-ca-islamic-umalqura' : 'en-US-u-ca-islamic-umalqura', {
          day: 'numeric', month: 'long', year: 'numeric', timeZone: tz || currentTimezone
        });
        return f.format(new Date());
      } catch (e) {
        return isAr ? 'مواقيت أم القرى' : 'Umm al-Qura Schedule';
      }
    }

    function applyPrayerTimesToDOM(data) {
      if (!data) return;
      prayerSchedule = data;
      const tFajr = document.getElementById('timeFajr');
      const tSunrise = document.getElementById('timeSunrise');
      const tIshraq = document.getElementById('timeIshraq');
      const tChasht = document.getElementById('timeChasht');
      const tDhuhr = document.getElementById('timeDhuhr');
      const tAsr = document.getElementById('timeAsr');
      const tMaghrib = document.getElementById('timeMaghrib');
      const tIsha = document.getElementById('timeIsha');

      if (tFajr) tFajr.textContent = formatTime12h(data.fajr);
      if (tSunrise) tSunrise.textContent = formatTime12h(data.sunrise);
      if (tIshraq) tIshraq.textContent = formatTime12h(data.ishraq);
      if (tChasht) tChasht.textContent = formatTime12h(data.chasht);
      if (tDhuhr) tDhuhr.textContent = formatTime12h(data.dhuhr);
      if (tAsr) tAsr.textContent = formatTime12h(data.asr);
      if (tMaghrib) tMaghrib.textContent = formatTime12h(data.maghrib);
      if (tIsha) tIsha.textContent = formatTime12h(data.isha);

      if (data.label) {
        const locLabelEl = document.getElementById('prayerLocLabel');
        if (locLabelEl) locLabelEl.textContent = data.label;
      }
      if (data.hijri) {
        const hEl = document.getElementById('liveHijriDate');
        if (hEl) hEl.textContent = data.hijri;
      }
      if (data.hijriAr) {
        const hArEl = document.getElementById('liveHijriArabic');
        if (hArEl) hArEl.textContent = data.hijriAr;
      }
      const chashtSubEl = document.getElementById('chashtDynamicSub');
      if (chashtSubEl && data.sunrise && data.dhuhr) {
        try {
          const sParts = data.sunrise.split(' ')[0].split(':');
          const dParts = data.dhuhr.split(' ')[0].split(':');
          const sm = parseInt(sParts[0], 10) * 60 + parseInt(sParts[1], 10);
          const dm = parseInt(dParts[0], 10) * 60 + parseInt(dParts[1], 10);
          const diff = Math.round((dm - sm) / 2);
          const dh = Math.floor(diff / 60);
          const dmin = diff % 60;
          if (IS_ARABIC) {
            chashtSubEl.textContent = '⚡ منتصف الضحى (الشروق + ' + dh + 'س ' + dmin + 'د)';
            chashtSubEl.title = 'حساب فلكي دقيق لمنتصف وقت الضحى بين الشروق (' + data.sunrise + ') والظهر (' + data.dhuhr + ')';
          } else {
            chashtSubEl.textContent = '⚡ Midpoint (Sunrise + ' + dh + 'h ' + dmin + 'm)';
            chashtSubEl.title = 'Astronomically calculated midpoint between Sunrise (' + data.sunrise + ') & Dhuhr (' + data.dhuhr + ')';
          }
        } catch(e) {
          chashtSubEl.textContent = IS_ARABIC ? '⚡ منتصف وقت الضحى الفلكي' : '⚡ Dynamic Sun Midpoint';
        }
      }
      updatePrayerCountdown();
    }

    function renderUnavailablePrayerState() {
      prayerSchedule = null;
      const ids = ['timeFajr', 'timeSunrise', 'timeIshraq', 'timeChasht', 'timeDhuhr', 'timeAsr', 'timeMaghrib', 'timeIsha'];
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '--:-- --';
      });
      const cardIds = ['pCardFajr', 'pCardSunrise', 'pCardIshraq', 'pCardChasht', 'pCardDhuhr', 'pCardAsr', 'pCardMaghrib', 'pCardIsha'];
      cardIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active-prayer');
      });
      const hEl = document.getElementById('timerHours');
      const mEl = document.getElementById('timerMinutes');
      const sEl = document.getElementById('timerSeconds');
      const nameEl = document.getElementById('nextPrayerName');
      const timeEl = document.getElementById('nextPrayerTime');
      if (hEl) hEl.textContent = '--';
      if (mEl) mEl.textContent = '--';
      if (sEl) sEl.textContent = '--';
      if (nameEl) nameEl.textContent = IS_ARABIC ? 'غير متاح' : 'Unavailable';
      if (timeEl) timeEl.textContent = '--:-- --';
      const chashtSubEl = document.getElementById('chashtDynamicSub');
      if (chashtSubEl) {
        chashtSubEl.textContent = IS_ARABIC ? '⚡ منتصف الضحى: غير متاح' : '⚡ Midpoint: Unavailable';
      }
    }

    function updateLiveClocks() {
      const now = new Date();
      const dateOpts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: currentTimezone };
      const dateEl = document.getElementById('liveGregorianDate');
      if (dateEl) {
        try {
          dateEl.textContent = now.toLocaleDateString(IS_ARABIC ? 'ar-SA' : 'en-US', dateOpts);
        } catch (e) {
          dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        }
      }

      const clockEl = document.getElementById('liveClockVal');
      if (clockEl) {
        try {
          const clockFormatter = new Intl.DateTimeFormat(IS_ARABIC ? 'ar-SA' : 'en-US', {
            timeZone: currentTimezone,
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
          });
          clockEl.textContent = clockFormatter.format(now);
        } catch (e) {
          let h = now.getHours();
          const m = String(now.getMinutes()).padStart(2, '0');
          const s = String(now.getSeconds()).padStart(2, '0');
          const ampm = IS_ARABIC ? (h >= 12 ? 'م' : 'ص') : (h >= 12 ? 'PM' : 'AM');
          h = h % 12;
          h = h ? h : 12;
          clockEl.textContent = `${String(h).padStart(2, '0')}:${m}:${s} ${ampm}`;
        }
      }

      // Midnight Rollover Check in target timezone
      if (currentTimezone && currentLatitude && currentLongitude) {
        const currentTzDate = getTargetDateString(currentTimezone);
        if (lastFetchedDateString && currentTzDate !== lastFetchedDateString) {
          lastFetchedDateString = currentTzDate;
          fetchPrayerForCoords(currentLatitude, currentLongitude, currentCityLabel, currentLocationSource, currentTimezone);
        }
      }

      updatePrayerCountdown();
    }

    function updatePrayerCountdown() {
      if (!prayerSchedule) return;
      const nowTz = getNowInTimezone(currentTimezone);

      const slots = [
        { key: 'Fajr', name: IS_ARABIC ? 'الفجر' : 'Fajr', time: prayerSchedule.fajr, cardId: 'pCardFajr' },
        { key: 'Sunrise', name: IS_ARABIC ? 'الشروق' : 'Sunrise', time: prayerSchedule.sunrise, cardId: 'pCardSunrise' },
        { key: 'Ishraq', name: IS_ARABIC ? 'الإشراق' : 'Ishraq', time: prayerSchedule.ishraq, cardId: 'pCardIshraq' },
        { key: 'Chasht', name: IS_ARABIC ? 'الضحى' : 'Chasht (Duha)', time: prayerSchedule.chasht, cardId: 'pCardChasht' },
        { key: 'Dhuhr', name: IS_ARABIC ? 'الظهر' : 'Dhuhr', time: prayerSchedule.dhuhr, cardId: 'pCardDhuhr' },
        { key: 'Asr', name: IS_ARABIC ? 'العصر' : 'Asr', time: prayerSchedule.asr, cardId: 'pCardAsr' },
        { key: 'Maghrib', name: IS_ARABIC ? 'المغرب' : 'Maghrib', time: prayerSchedule.maghrib, cardId: 'pCardMaghrib' },
        { key: 'Isha', name: IS_ARABIC ? 'العشاء' : 'Isha', time: prayerSchedule.isha, cardId: 'pCardIsha' }
      ];

      function timeToSeconds(timeStr) {
        if (!timeStr) return 0;
        const clean = timeStr.split(' ')[0];
        const parts = clean.split(':');
        return parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60;
      }

      let nextSlot = null;
      let remainingSecs = 0;

      for (let i = 0; i < slots.length; i++) {
        const slotSecs = timeToSeconds(slots[i].time);
        if (slotSecs > nowTz.totalSeconds) {
          nextSlot = slots[i];
          remainingSecs = slotSecs - nowTz.totalSeconds;
          break;
        }
      }

      // If all passed today, next is tomorrow's Fajr
      if (!nextSlot) {
        nextSlot = slots[0];
        const fajrSecs = timeToSeconds(slots[0].time);
        remainingSecs = (86400 - nowTz.totalSeconds) + fajrSecs;
      }

      if (nextSlot) {
        const hours = Math.floor(remainingSecs / 3600);
        const mins = Math.floor((remainingSecs % 3600) / 60);
        const secs = remainingSecs % 60;

        const hEl = document.getElementById('timerHours');
        const mEl = document.getElementById('timerMinutes');
        const sEl = document.getElementById('timerSeconds');
        const nameEl = document.getElementById('nextPrayerName');
        const azanTimeEl = document.getElementById('nextPrayerTime');

        if (hEl) hEl.textContent = String(hours).padStart(2, '0');
        if (mEl) mEl.textContent = String(mins).padStart(2, '0');
        if (sEl) sEl.textContent = String(secs).padStart(2, '0');
        if (nameEl) nameEl.textContent = nextSlot.name;
        if (azanTimeEl) azanTimeEl.textContent = formatTime12h(nextSlot.time);

        // Highlight active card
        slots.forEach(s => {
          const el = document.getElementById(s.cardId);
          if (el) {
            if (s.key === nextSlot.key) {
              el.classList.add('active-prayer');
            } else {
              el.classList.remove('active-prayer');
            }
          }
        });
      }
    }

        // Fallback to coordinates / generic label
      }

      // 3. Fallback if both reverse-geocoders fail
      const inSaudi = (lat >= 16.0 && lat <= 32.5 && lng >= 34.5 && lng <= 55.7);
      const defCity = fallbackCity || (IS_ARABIC ? 'موقع محدد' : 'Detected Location');
      const defCountry = fallbackCountry || (inSaudi ? (IS_ARABIC ? 'المملكة العربية السعودية' : 'Saudi Arabia') : '');
      return defCountry ? (defCity + sep + defCountry) : defCity;
    }

    function showFailureNotice(msg) {
      let noticeEl = document.getElementById('prayerFailureNotice');
      if (!noticeEl) {
        noticeEl = document.createElement('div');
        noticeEl.id = 'prayerFailureNotice';
        noticeEl.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#b91c1c;color:#ffffff;padding:12px 20px;border-radius:8px;font-size:13.5px;font-weight:600;box-shadow:0 6px 18px rgba(0,0,0,0.25);z-index:9999;transition:opacity 0.3s ease;pointer-events:none;max-width:90vw;text-align:center;';
        document.body.appendChild(noticeEl);
      }
      noticeEl.textContent = msg;
      noticeEl.style.opacity = '1';
      clearTimeout(noticeEl._timeout);
      noticeEl._timeout = setTimeout(() => { noticeEl.style.opacity = '0'; }, 4000);
    }
    // ==========================================
    // LIVE CURRENT TEMPERATURE ENGINE (OPEN-METEO)
    // ==========================================
    let activeWeatherRequestId = 0;
    const weatherCache = {};
    const WEATHER_REFRESH_INTERVAL_MS = 900000; // 15 minutes
    let weatherRefreshTimerId = null;
    let lastWeatherFetchTimestamp = 0;

    function mapWmoToWeatherIcon(code) {
      if (code === 0) return 'fas fa-sun';
      if (code === 1 || code === 2) return 'fas fa-cloud-sun';
      if (code === 3) return 'fas fa-cloud';
      if (code === 45 || code === 48) return 'fas fa-smog';
      if (code >= 51 && code <= 57) return 'fas fa-cloud-rain';
      if (code >= 61 && code <= 67) return 'fas fa-cloud-showers-heavy';
      if (code >= 71 && code <= 77) return 'fas fa-snowflake';
      if (code >= 80 && code <= 82) return 'fas fa-cloud-rain';
      if (code >= 85 && code <= 86) return 'fas fa-snowflake';
      if (code >= 95 && code <= 99) return 'fas fa-bolt';
      return 'fas fa-temperature-half';
    }
          const iconClass = mapWmoToWeatherIcon(data.current.weather_code);

          weatherCache[cacheKey] = {
            temp: tempC,
            iconClass: iconClass,
            timestamp: now
          };

          tempEl.textContent = tempC + '°C';
          iconEl.className = iconClass;
          badgeEl.setAttribute('aria-label', (IS_ARABIC ? 'درجة الحرارة الحالية: ' : 'Current temperature: ') + tempC + '°C');
          badgeEl.title = (IS_ARABIC ? 'درجة الحرارة الحالية: ' : 'Current temperature: ') + tempC + '°C';
          lastWeatherFetchTimestamp = now;
          saveLocationToStorage({
            weather: {
              temp: tempC,
              iconClass: iconClass,
              timestamp: now
            }
          });
        }
      } catch (err) {
        console.warn('Weather fetch fallback:', err);
      } finally {
        if (reqId === activeWeatherRequestId) {
          badgeEl.style.opacity = '1';
        }
      }
    }

    function triggerPeriodicWeatherRefresh() {
      if (document.hidden) return;
      if (typeof currentLatitude === 'number' && typeof currentLongitude === 'number' &&
          isFinite(currentLatitude) && isFinite(currentLongitude)) {
        fetchWeatherForCoords(currentLatitude, currentLongitude, true);
      }
    }

    function startWeatherPeriodicRefresh() {
      if (weatherRefreshTimerId) {
        clearInterval(weatherRefreshTimerId);
        weatherRefreshTimerId = null;
      }
      weatherRefreshTimerId = setInterval(triggerPeriodicWeatherRefresh, WEATHER_REFRESH_INTERVAL_MS);
    }

    // ==========================================
    // QIBLA COMPASS & DEVICE ORIENTATION ENGINE
    // ==========================================
    const KAABA_LAT = 21.422487;
    const KAABA_LNG = 39.826206;

    let currentQiblaBearing = 244;
    let currentQiblaDistanceKm = 1181;
    let locationSourceType = IS_ARABIC ? 'الوضع الافتراضي' : 'Baseline Fallback';
    let isLiveOrientationActive = false;
    let liveDeviceHeading = null;
    let orientationRafId = null;

    function calculateQiblaBearing(userLat, userLng) {
      const phiU = userLat * (Math.PI / 180);
      const phiK = KAABA_LAT * (Math.PI / 180);
      const deltaLng = (KAABA_LNG - userLng) * (Math.PI / 180);

      const y = Math.sin(deltaLng);
      const x = Math.cos(phiU) * Math.tan(phiK) - Math.sin(phiU) * Math.cos(deltaLng);
      const bearingRad = Math.atan2(y, x);
      const bearingDeg = ((bearingRad * 180 / Math.PI) + 360) % 360;
      return bearingDeg;
    }

    function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
      const R = 6371; // Earth's mean radius in km
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    const COMPASS_16_POINTS = [
      'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
    ];

    function get16WindDirection(deg) {
      const idx = Math.round(deg / 22.5) % 16;
      return COMPASS_16_POINTS[idx];
    }

    function updateQiblaAccuracyTag(text) {
      const accTagEl = document.getElementById('qiblaAccuracyTag');
      if (accTagEl) {
        accTagEl.innerHTML = '<i class="fas fa-info-circle" style="color: #f59e0b;"></i> ' + text;
      }
    }

    function updateQiblaDisplay(lat, lng, sourceType) {
      currentLatitude = lat;
      currentLongitude = lng;
      if (sourceType) locationSourceType = sourceType;

      const dist = calculateHaversineDistance(lat, lng, KAABA_LAT, KAABA_LNG);
      currentQiblaDistanceKm = Math.round(dist);

      const degreeEl = document.getElementById('qiblaDegreeVal');
      const dirEl = document.getElementById('qiblaDirectionLabel');
      const distEl = document.getElementById('qiblaDistVal');
      const accTagEl = document.getElementById('qiblaAccuracyTag');
      const destTextEl = document.getElementById('qiblaDestText');
      const ariaLive = document.getElementById('qiblaAriaLive');
      const needle = document.getElementById('qiblaNeedleGroup');
      const kaabaMarker = document.getElementById('kaabaDialMarker');

      if (dist < 5) {
        if (degreeEl) degreeEl.textContent = IS_ARABIC ? 'مكة المكرمة' : 'Makkah';
        if (dirEl) dirEl.textContent = IS_ARABIC ? 'الحرم المكي' : 'Holy Haram';
        if (distEl) distEl.textContent = '< 5 km';
        if (destTextEl) {
          destTextEl.innerHTML = '<i class="fas fa-kaaba" style="color: #fbbf24;"></i> ' + (IS_ARABIC ? 'أنت بجوار الكعبة المشرفة في مكة المكرمة' : 'You are near the Holy Kaaba in Makkah — all directions lead toward the Haram.');
        }
        if (accTagEl) {
          accTagEl.innerHTML = '<i class="fas fa-check-circle" style="color: #34d399;"></i> ' + locationSourceType;
        }
        if (needle) needle.setAttribute('transform', 'rotate(0 80 80)');
        if (kaabaMarker) kaabaMarker.setAttribute('transform', 'rotate(0 80 80)');
        if (ariaLive) ariaLive.textContent = IS_ARABIC ? 'أنت في مكة المكرمة بجوار الكعبة المشرفة.' : 'You are in Makkah near the Holy Kaaba.';
        return;
      }

      const bearing = calculateQiblaBearing(lat, lng);
      currentQiblaBearing = Math.round(bearing);
      const windDir = get16WindDirection(bearing);

      if (degreeEl) degreeEl.textContent = currentQiblaBearing + '°';
      if (dirEl) dirEl.textContent = windDir;
      if (distEl) distEl.textContent = currentQiblaDistanceKm.toLocaleString() + ' km';
      if (destTextEl) {
        destTextEl.innerHTML = '<i class="fas fa-location-dot" style="color: #38bdf8;"></i> ' + (IS_ARABIC ? 'باتجاه الكعبة المشرفة بمكة المكرمة' : 'Towards the Holy Kaaba in Makkah');
      }

      let iconClass = 'fa-satellite-dish';
      let iconColor = '#94a3b8';
      const sLower = locationSourceType.toLowerCase();
      if (sLower.includes('gps') || sLower.includes('نظام gps')) {
        iconClass = 'fa-crosshairs';
        iconColor = '#34d399';
      } else if (sLower.includes('ip') || sLower.includes('approximate') || sLower.includes('تقريبي')) {
        iconClass = 'fa-network-wired';
        iconColor = '#38bdf8';
      } else if (sLower.includes('city') || sLower.includes('المدينة')) {
        iconClass = 'fa-city';
        iconColor = '#fbbf24';
      }
      if (accTagEl) {
        accTagEl.innerHTML = '<i class="fas ' + iconClass + '" style="color: ' + iconColor + ';"></i> ' + locationSourceType;
      }

      if (!isLiveOrientationActive) {
        if (needle) needle.setAttribute('transform', 'rotate(' + currentQiblaBearing + ' 80 80)');
        if (kaabaMarker) kaabaMarker.setAttribute('transform', 'rotate(' + currentQiblaBearing + ' 80 80)');
      }

      if (ariaLive) {
        ariaLive.textContent = IS_ARABIC ?
          ('اتجاه القبلة هو ' + currentQiblaBearing + ' درجة ' + windDir + '، وتبعد ' + currentQiblaDistanceKm + ' كم عن الكعبة المشرفة.') :
          ('Qibla direction is ' + currentQiblaBearing + ' degrees ' + windDir + ', ' + currentQiblaDistanceKm + ' kilometers to the Kaaba in Makkah.');
      }
    }

    function setupDeviceOrientation() {
      const btn = document.getElementById('btnEnableCompass');
      const label = document.getElementById('compassOrientationLabel');

      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        if (btn) btn.style.display = 'inline-flex';
        if (label) label.innerHTML = '<i class="fas fa-compass"></i> ' + (IS_ARABIC ? 'بوصلة رقمية (اضغط للتفعيل)' : 'Digital Compass (Tap to Enable)');
        return;
      }

      if ('ondeviceorientationabsolute' in window) {
        window.addEventListener('deviceorientationabsolute', handleOrientationEvent, true);
        isLiveOrientationActive = true;
        if (label) label.innerHTML = '<i class="fas fa-compass"></i> ' + (IS_ARABIC ? 'البوصلة المباشرة نشطة' : 'Live Compass Active');
      } else if ('ondeviceorientation' in window) {
        window.addEventListener('deviceorientation', handleOrientationEvent, true);
        isLiveOrientationActive = true;
        if (label) label.innerHTML = '<i class="fas fa-compass"></i> ' + (IS_ARABIC ? 'البوصلة المباشرة نشطة' : 'Live Compass Active');
      } else {
        if (label) label.innerHTML = '<i class="fas fa-compass"></i> ' + (IS_ARABIC ? 'وضع البوصلة الثابتة' : 'Static Compass Mode');
      }
    }

    function requestCompassPermission() {
      const btn = document.getElementById('btnEnableCompass');
      const label = document.getElementById('compassOrientationLabel');

      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(function(state) {
            if (state === 'granted') {
              window.addEventListener('deviceorientation', handleOrientationEvent, true);
              isLiveOrientationActive = true;
              if (btn) btn.style.display = 'none';
              if (label) label.innerHTML = '<i class="fas fa-compass"></i> ' + (IS_ARABIC ? 'البوصلة المباشرة نشطة' : 'Live Compass Active');
            } else {
              if (btn) {
                btn.innerHTML = '<i class="fas fa-times"></i> ' + (IS_ARABIC ? 'تم رفض الإذن' : 'Access Denied');
                btn.disabled = true;
              }
            }
          })
          .catch(function(err) {
            console.warn('Compass permission error:', err);
            if (label) label.innerHTML = '<i class="fas fa-compass"></i> ' + (IS_ARABIC ? 'وضع البوصلة الثابتة' : 'Static Compass Mode');
          });
      }
    }

    function handleOrientationEvent(event) {
      if (!event) return;

      let compassHeading = null;
      if (typeof event.webkitCompassHeading !== 'undefined') {
        compassHeading = event.webkitCompassHeading;
      } else if (event.alpha !== null && typeof event.alpha !== 'undefined') {
        compassHeading = (360 - event.alpha + 360) % 360;
      }

      if (compassHeading === null || isNaN(compassHeading)) return;
      liveDeviceHeading = compassHeading;

      if (!orientationRafId) {
        orientationRafId = requestAnimationFrame(renderLiveCompass);
      }
    }

    function renderLiveCompass() {
      orientationRafId = null;
      if (liveDeviceHeading === null) return;

      const dialSvg = document.querySelector('.qibla-dial-svg');
      const dialRotation = (-liveDeviceHeading + 360) % 360;
      const needleRotation = (currentQiblaBearing - liveDeviceHeading + 360) % 360;

      if (dialSvg) {
        dialSvg.style.transform = 'rotate(' + dialRotation + 'deg)';
        dialSvg.style.transition = 'transform 0.12s ease-out';
      }

      const label = document.getElementById('compassOrientationLabel');
      const diff = Math.abs(needleRotation % 360);
      const isFacingQibla = (diff <= 6 || diff >= 354);
      if (label) {
        if (isFacingQibla) {
          label.innerHTML = '<i class="fas fa-check-circle" style="color: #34d399;"></i> ' + (IS_ARABIC ? 'أنت تواجه القبلة مباشرة!' : 'Facing Qibla!');
          label.style.borderColor = '#10b981';
          label.style.color = '#34d399';
        } else {
          label.innerHTML = '<i class="fas fa-compass"></i> ' + (IS_ARABIC ? 'البوصلة المباشرة نشطة' : 'Live Compass Active');
          label.style.borderColor = 'rgba(255, 255, 255, 0.08)';
          label.style.color = '#94a3b8';
        }
      }
    }

    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        if (orientationRafId) {
          cancelAnimationFrame(orientationRafId);
          orientationRafId = null;
        }
      } else {
        const now = Date.now();
        if (now - lastWeatherFetchTimestamp >= WEATHER_REFRESH_INTERVAL_MS) {
          triggerPeriodicWeatherRefresh();
        }
      }
    });

    function selectCity(btnEl, cityKey, lat, lng, label) {
      let tz = 'Asia/Riyadh';
      if (QUICK_CITIES[cityKey] && QUICK_CITIES[cityKey].tz) {
        tz = QUICK_CITIES[cityKey].tz;
      }
      fetchPrayerForCoords(lat, lng, label, 'manual', tz, cityKey);
    }

    async function syncCurrentDeviceLocation(isUserInitiated = false) {
      const btn = document.getElementById('btnDetectLoc');
      if (isUserInitiated && btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + (IS_ARABIC ? 'جاري التحديد...' : 'Detecting...');
        btn.disabled = true;
      }

      if (!navigator.geolocation) {
        if (isUserInitiated && btn) {
          btn.innerHTML = '<i class="fas fa-crosshairs"></i> ' + (IS_ARABIC ? 'تحديد موقعي تلقائياً' : 'Detect My Location');
          btn.disabled = false;
        }
        return false;
      }

      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async function(pos) {
            try {
              if (pos && pos.coords) {
                const gpsLat = pos.coords.latitude;
                const gpsLng = pos.coords.longitude;
                const inSaudi = (gpsLat >= 16.0 && gpsLat <= 32.5 && gpsLng >= 34.5 && gpsLng <= 55.7);
                const fallbackCity = IS_ARABIC ? 'موقع محدد' : 'Detected Location';
                const fallbackCountry = inSaudi ? (IS_ARABIC ? 'المملكة العربية السعودية' : 'Saudi Arabia') : '';
                const preciseLabel = await reverseGeocodeWithOSM(gpsLat, gpsLng, fallbackCity, fallbackCountry);
                const success = await fetchPrayerForCoords(gpsLat, gpsLng, preciseLabel, 'gps', null, null);
                resolve(success);
              } else {
                resolve(false);
              }
            } catch (e) {
              console.warn('GPS location handling error:', e);
              resolve(false);
            } finally {
              if (btn) {
                btn.innerHTML = '<i class="fas fa-crosshairs"></i> ' + (IS_ARABIC ? 'تحديد موقعي تلقائياً' : 'Detect My Location');
                btn.disabled = false;
              }
            }
          },
          function(err) {
            console.log('GPS device status:', err.message);
            if (isUserInitiated) {
              let reason = IS_ARABIC ? 'نظام GPS غير متاح' : 'GPS Unavailable';
              if (err.code === 1) {
                reason = IS_ARABIC ? 'تم رفض إذن GPS (استخدام الموقع التلقائي)' : 'GPS Denied (Using Fallback)';
              } else if (err.code === 2) {
                reason = IS_ARABIC ? 'نظام GPS غير متوفر (استخدام الموقع التلقائي)' : 'GPS Unavailable (Using Fallback)';
              } else if (err.code === 3) {
                reason = IS_ARABIC ? 'انتهت مهلة GPS (استخدام الموقع التلقائي)' : 'GPS Timeout (Using Fallback)';
              }
              updateQiblaAccuracyTag(reason);
              const locLabelEl = document.getElementById('prayerLocLabel');
              if (locLabelEl && currentCityLabel) {
                locLabelEl.textContent = currentCityLabel;
              }
            }
            if (btn) {
              btn.innerHTML = '<i class="fas fa-crosshairs"></i> ' + (IS_ARABIC ? 'تحديد موقعي تلقائياً' : 'Detect My Location');
              btn.disabled = false;
            }
            resolve(false);
          },
          { enableHighAccuracy: true, timeout: 9000, maximumAge: 0 }
        );
      });
    }

    function triggerGpsRefresh() {
      return syncCurrentDeviceLocation(true);
    }

    function executeGpsTrack(isUserInitiated = false) {
      return syncCurrentDeviceLocation(isUserInitiated);
    }

    async function initAutoPrayerTimes() {
      // 1. Check canonical persisted state in localStorage
      const stored = getStoredLocation();
      let initLat = 24.7136;
      let initLng = 46.6753;
      let initLabel = IS_ARABIC ? 'الرياض، السعودية' : 'Riyadh, Saudi Arabia';
      let initTz = 'Asia/Riyadh';
      let initSource = 'default';
      let matchingKey = 'riyadh';

      if (stored) {
        initLat = stored.lat;
        initLng = stored.lng;
        initTz = stored.timezone || 'Asia/Riyadh';
        initSource = stored.source || 'manual';

        matchingKey = findMatchingCityKey(initLat, initLng);
        // Locality Protection: stored.label is authoritative for locality display
        if (stored.label) {
          initLabel = stored.label;
        } else if (matchingKey && QUICK_CITIES[matchingKey]) {
          initLabel = IS_ARABIC ? QUICK_CITIES[matchingKey].ar : QUICK_CITIES[matchingKey].en;
          initTz = QUICK_CITIES[matchingKey].tz || initTz;
        }
      }

      currentLatitude = initLat;
      currentLongitude = initLng;
      currentCityLabel = initLabel;
      currentTimezone = initTz;
      currentLocationSource = initSource;

      // Update visible DOM immediately (instant paint, zero layout shift)
      const locLabelEl = document.getElementById('prayerLocLabel');
      if (locLabelEl && stored) locLabelEl.textContent = currentCityLabel;
      if (stored) highlightCityButton(matchingKey);

      // Initial instantaneous DOM render: priority to cached schedule
      if (stored && stored.schedule) {
        hasCommittedPrayerSchedule = true;
        prayerSchedule = stored.schedule;
        applyPrayerTimesToDOM(stored.schedule);
      } else if (stored) {
        const fallbackEntry = defaultPrayerMap[matchingKey] || defaultPrayerMap.riyadh;
        applyPrayerTimesToDOM({
          fajr: fallbackEntry.fajr,
          sunrise: fallbackEntry.sunrise,
          ishraq: fallbackEntry.ishraq,
          chasht: fallbackEntry.chasht,
          dhuhr: fallbackEntry.dhuhr,
          asr: fallbackEntry.asr,
          maghrib: fallbackEntry.maghrib,
          isha: fallbackEntry.isha,
          label: currentCityLabel,
          hijri: getDynamicHijriFallback(false, currentTimezone),
          hijriAr: '(' + getDynamicHijriFallback(true, currentTimezone) + ')'
        });
      }

      let initialSourceTag = (stored && stored.sourceTag) || null;
      if (!initialSourceTag) {
        if (initSource === 'manual') {
          initialSourceTag = IS_ARABIC ? ('اختيار المدينة (' + initLabel.split('،')[0].split(',')[0] + ')') : ('City Selection (' + initLabel.split(',')[0] + ')');
        } else if (initSource === 'gps') {
          initialSourceTag = IS_ARABIC ? 'دقة نظام GPS' : 'GPS Precision';
        } else if (initSource === 'ip') {
          initialSourceTag = IS_ARABIC ? 'موقع تقريبي (IP)' : 'Approximate Location (IP)';
        } else {
          initialSourceTag = IS_ARABIC ? 'الوضع الافتراضي' : 'Baseline Fallback';
        }
      }

      updateQiblaDisplay(initLat, initLng, initialSourceTag);
      fetchWeatherForCoords(initLat, initLng, true);
      setupDeviceOrientation();

      // Start live clock ticking
      updateLiveClocks();
      setInterval(updateLiveClocks, 1000);
      startWeatherPeriodicRefresh();

      // Silent non-blocking background revalidation when valid cached data exists
      if (stored && stored.schedule) {
        (async function() {
          let freshGpsAcquired = false;
          if (navigator.geolocation && (initSource === 'gps' || initSource === 'default')) {
            freshGpsAcquired = await syncCurrentDeviceLocation(false);
          }
          if (!freshGpsAcquired) {
            await fetchPrayerForCoords(initLat, initLng, currentCityLabel, initSource, currentTimezone, matchingKey, true);
          }
        })();
        return;
      }

      // Cold first visit without cached schedule:
      // 2. Authoritative Current Geolocation Check:
      // Unconditionally query fresh device geolocation whenever supported.
      // MaximumAge: 0 guarantees fresh coordinates; no permissions gating; no distance suppression.
      let freshGpsAcquired = false;
      if (navigator.geolocation) {
        freshGpsAcquired = await syncCurrentDeviceLocation(false);
      }

      // 3. Fallback chain if live GPS is denied, timed out, or unavailable:
      if (!freshGpsAcquired) {
        if (stored) {
          // Cleanly revalidate and preserve stored location schedule
          await fetchPrayerForCoords(initLat, initLng, currentCityLabel, initSource, currentTimezone, matchingKey);
        } else {
          // Cold first visit without GPS: fallback to IP location, then baseline Riyadh
          await fetchIPLocationFallback(initLat, initLng, initLabel, initTz);
        }
      }
    }

    // Auto-init on page load
    window.addEventListener('DOMContentLoaded', initAutoPrayerTimes);

  
  </script>
  
