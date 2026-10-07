// ==========================================
// CENTRALIZED PRAYER API FETCH LOGIC
// ==========================================

    let nominatimQueue = Promise.resolve();

    // High-Precision Universal Reverse Geocoder (Cleaned: no hardcoded street overrides, resilient abort timeouts, global support)
    async function reverseGeocodeWithOSM(lat, lng, fallbackCity, fallbackCountry, langOverride = null) {
      const isAr = langOverride ? (langOverride === 'ar') : IS_ARABIC;
      const sep = isAr ? '، ' : ', ';

      // 1. Primary: OSM Nominatim with AbortController (3s timeout)
      try {
        const osmUrl = 'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + encodeURIComponent(lat) + '&lon=' + encodeURIComponent(lng) + '&accept-language=' + (isAr ? 'ar' : 'en');
        const res = await new Promise((resolve, reject) => {
          nominatimQueue = nominatimQueue.then(async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            try {
              const r = await fetch(osmUrl, { headers: { 'Accept': 'application/json' }, signal: controller.signal });
              clearTimeout(timeoutId);
              resolve(r);
            } catch (err) {
              clearTimeout(timeoutId);
              reject(err);
            }
            await new Promise(timer => setTimeout(timer, 1100));
          });
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            let area = addr.neighbourhood || addr.suburb || addr.city_district || addr.district || addr.borough || addr.village || addr.hamlet || addr.quarter || addr.residential || '';
            let city = addr.city || addr.town || addr.municipality || addr.county || addr.state_district || addr.state || '';

            if (area && city && area.toLowerCase() !== city.toLowerCase()) {
              return area + sep + city;
            } else if (area) {
              return area;
            } else if (city) {
              return city;
            }
          }
        }
      } catch (e) {
        // Fallback silently to BDC
      }

      // 2. Fallback: BigDataCloud Reverse Geocoding with AbortController (3.5s timeout)
      try {
        const controller2 = new AbortController();
        const timeoutId2 = setTimeout(() => controller2.abort(), 3500);
        const bdcUrl = 'https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=' + encodeURIComponent(lat) + '&longitude=' + encodeURIComponent(lng) + '&localityLanguage=' + (isAr ? 'ar' : 'en');
        const bRes = await fetch(bdcUrl, { signal: controller2.signal });
        clearTimeout(timeoutId2);
        if (bRes.ok) {
          const bData = await bRes.json();
          let area = bData.locality || '';
          let city = bData.city || '';
          if (!city && bData.localityInfo && Array.isArray(bData.localityInfo.administrative)) {
            const admin = bData.localityInfo.administrative;
            for (let i = 0; i < admin.length; i++) {
              if (admin[i].adminLevel === 4 || admin[i].adminLevel === 5 || admin[i].adminLevel === 6) {
                city = admin[i].name;
                break;
              }
            }
          }
          if (!city) city = bData.principalSubdivision || '';

          if (area && city && area.toLowerCase() !== city.toLowerCase()) {
              return area + sep + city;
            } else if (area) {
              return area;
            } else if (city) {
              return city;
            }
        }
      } catch (e2) {
        // Fallback to coordinates / generic label
      }

      // 3. Fallback if both reverse-geocoders fail
      const inSaudi = (lat >= 16.0 && lat <= 32.5 && lng >= 34.5 && lng <= 55.7);
      const defCity = fallbackCity || (IS_ARABIC ? 'موقع محدد' : 'Detected Location');
      const defCountry = fallbackCountry || (inSaudi ? (IS_ARABIC ? 'المملكة العربية السعودية' : 'Saudi Arabia') : '');
      return defCountry ? (defCity + sep + defCountry) : defCity;
    }

    async function fetchPrayerForCoords(stagedLat, stagedLng, stagedLabel, stagedSource, stagedTz, stagedCityKey, isSilent = false, labelEn = null, labelAr = null) {
      const reqId = ++activePrayerRequestId;

      try {
        let resolvedTz = stagedTz;
        let pData = null;
        let usedDateStr = null;

        // Stage 1: Construct initial bootstrap date using either the known timezone or the browser's native timezone.
        // The native timezone is strictly temporary and is never used as the authoritative GPS timezone.
        const bootTz = resolvedTz || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        const bootDateParts = new Intl.DateTimeFormat('en-GB', { timeZone: bootTz }).format(new Date()).split('/');
        const bootDateStr = (bootDateParts[0] + '-' + bootDateParts[1] + '-' + bootDateParts[2]).replace(/[\u200E\u200F]/g, '');
        
        // Query the safe date-specific endpoint to bypass failing dateless endpoint
        const aladhanUrl = 'https://api.aladhan.com/v1/timings/' + bootDateStr + '?latitude=' + stagedLat + '&longitude=' + stagedLng + '&method=4';
        const pRes = await fetch(aladhanUrl);
        if (reqId !== activePrayerRequestId) return; // Drop stale response
        
        if (pRes.ok) {
          const tempPData = await pRes.json();
          if (tempPData && tempPData.data && tempPData.data.meta && tempPData.data.meta.timezone) {
            // Extract the exact mathematically correct IANA timezone from Aladhan's GPS response
            resolvedTz = tempPData.data.meta.timezone;

            // Stage 2: Calculate the actual date for the location using the newly resolved true timezone
            const expectedDateParts = new Intl.DateTimeFormat('en-GB', { timeZone: resolvedTz }).format(new Date()).split('/');
            const expectedDateStr = (expectedDateParts[0] + '-' + expectedDateParts[1] + '-' + expectedDateParts[2]).replace(/[\u200E\u200F]/g, '');
            const apiDate = tempPData.data.date?.gregorian?.date;
            
            // If the calculated location calendar date perfectly matches the bootstrap response, it is safe to use.
            if ((apiDate && apiDate === expectedDateStr) || bootDateStr === expectedDateStr) {
              pData = tempPData;
              usedDateStr = expectedDateStr;
            } else {
              // Location calendar date differs from bootstrap date (e.g., crossing midnight). Re-fetch with correct actual date.
              usedDateStr = expectedDateStr;
              const reUrl = 'https://api.aladhan.com/v1/timings/' + expectedDateStr + '?latitude=' + stagedLat + '&longitude=' + stagedLng + '&method=4';
              const reRes = await fetch(reUrl);
              if (reqId !== activePrayerRequestId) return;
              if (reRes.ok) {
                pData = await reRes.json();
              }
            }
          }
        }

        if (reqId !== activePrayerRequestId) return; // Drop stale response

        // Validate prayer response safely. If structurally invalid, explicitly throw to trigger standard unavailable state.
        if (!pData || !pData.data || !pData.data.timings || !pData.data.timings.Fajr || !pData.data.timings.Dhuhr) {
          throw new Error('API Data Invalid');
        }

        // Validate prayer response
        if (pData && pData.data && pData.data.timings && pData.data.timings.Fajr && pData.data.timings.Dhuhr) {
          const t = pData.data.timings;
          if (pData.data.meta && pData.data.meta.timezone) {
            resolvedTz = pData.data.meta.timezone;
          }
          if (!resolvedTz) resolvedTz = 'Asia/Riyadh';

          const sunriseTime = t.Sunrise.split(' ')[0];
          const dhuhrTime = t.Dhuhr.split(' ')[0];
          const ishraqCalculated = addMinutesToTime(sunriseTime, 18);
          const chashtCalculated = getMidpointTime(sunriseTime, dhuhrTime);

          let hijriStr = '';
          let hijriArStr = '';
          if (pData.data.date && pData.data.date.hijri) {
            const h = pData.data.date.hijri;
            hijriStr = h.day + ' ' + h.month.en + ' ' + h.year + ' AH';
            hijriArStr = '(' + h.day + ' ' + h.month.ar + ' ' + h.year + ' هـ)';
          } else {
            hijriStr = getDynamicHijriFallback(false, resolvedTz);
            hijriArStr = '(' + getDynamicHijriFallback(true, resolvedTz) + ')';
          }

          // === ATOMIC COMMIT ===
          hasCommittedPrayerSchedule = true;
          currentLatitude = stagedLat;
          currentLongitude = stagedLng;
          currentCityLabel = stagedLabel;
          currentLocationSource = stagedSource;
          currentTimezone = resolvedTz;
          if (usedDateStr) {
            const p = usedDateStr.split('-');
            lastFetchedDateString = p[2] + '-' + p[1] + '-' + p[0];
          }

          const validatedSchedule = {
            fajr: t.Fajr.split(' ')[0],
            sunrise: sunriseTime,
            ishraq: ishraqCalculated,
            chasht: chashtCalculated,
            dhuhr: dhuhrTime,
            asr: t.Asr.split(' ')[0],
            maghrib: t.Maghrib.split(' ')[0],
            isha: t.Isha.split(' ')[0],
            label: currentCityLabel,
            hijri: hijriStr,
            hijriAr: hijriArStr
          };

          // Update visible DOM
          const locLabelEl = document.getElementById('prayerLocLabel');
          if (locLabelEl) locLabelEl.textContent = currentCityLabel;
          applyPrayerTimesToDOM(validatedSchedule);

          const srcLabel = IS_ARABIC ?
            (stagedSource === 'manual' ? ('اختيار المدينة (' + stagedLabel.split('،')[0].split(',')[0] + ')') : (stagedSource === 'gps' ? 'دقة نظام GPS' : 'موقع تقريبي (IP)')) :
            (stagedSource === 'manual' ? ('City Selection (' + stagedLabel.split(',')[0] + ')') : (stagedSource === 'gps' ? 'GPS Precision' : 'Approximate Location (IP)'));

          updateQiblaDisplay(currentLatitude, currentLongitude, srcLabel);
          fetchWeatherForCoords(currentLatitude, currentLongitude, true);

          const matchingKey = stagedCityKey || findMatchingCityKey(currentLatitude, currentLongitude);
          highlightCityButton(matchingKey);

          // Persist to storage
          let existingStored = getStoredLocation() || {};
          let isSameLoc = existingStored.lat && Math.abs(existingStored.lat - currentLatitude) < 0.05 && Math.abs(existingStored.lng - currentLongitude) < 0.05;

          saveLocationToStorage({
            lat: currentLatitude,
            lng: currentLongitude,
            label: currentCityLabel,
            labelEn: labelEn || (!IS_ARABIC ? currentCityLabel : (isSameLoc ? existingStored.labelEn : null)),
            labelAr: labelAr || (IS_ARABIC ? currentCityLabel : (isSameLoc ? existingStored.labelAr : null)),
            timezone: currentTimezone,
            source: currentLocationSource,
            sourceTag: srcLabel,
            schedule: validatedSchedule,
            timestamp: Date.now(),
            lang: IS_ARABIC ? 'ar' : 'en'
          });

          return true;
        } else {
          throw new Error('Invalid prayer data response');
        }
      } catch (e) {
        if (reqId !== activePrayerRequestId) return; // Drop stale response
        const fallbackStored = !prayerSchedule ? getStoredLocation() : null;
        if (fallbackStored && fallbackStored.schedule && !prayerSchedule) {
          prayerSchedule = fallbackStored.schedule;
          hasCommittedPrayerSchedule = true;
          applyPrayerTimesToDOM(prayerSchedule);
        }
        if (hasCommittedPrayerSchedule && prayerSchedule) {
          // A valid prayer schedule is ALREADY COMMITTED from a prior successful fetch:
          // Retain current valid location, coordinates, timezone, city label, and current prayer times
          const committedKey = findMatchingCityKey(currentLatitude, currentLongitude);
          highlightCityButton(committedKey);

          const locLabelEl = document.getElementById('prayerLocLabel');
          if (locLabelEl) locLabelEl.textContent = currentCityLabel;

          if (!isSilent) {
            const failMsg = IS_ARABIC ?
              'تعذر تحميل مواقيت الصلاة للموقع المطلوب. تم الاحتفاظ بالموقع الحالي.' :
              'Unable to load prayer times for the requested location. Retaining current location.';
            showFailureNotice(failMsg);
            updateQiblaAccuracyTag(IS_ARABIC ? 'خطأ في الاتصال' : 'Connection Error');
          }
          return false;
        } else {
          // NO valid prayer schedule was ever committed (e.g. fresh load or initial failure):
          renderUnavailablePrayerState();
          const unavailableMsg = IS_ARABIC ?
            'تعذر تحميل مواقيت الصلاة. يرجى التحقق من الاتصال.' :
            'Unable to load prayer times. Please check your connection.';
          showFailureNotice(unavailableMsg);
          updateQiblaAccuracyTag(IS_ARABIC ? 'غير متاح' : 'Unavailable');
          return false;
        }
      }
    }

    // ==========================================


    async function fetchWeatherForCoords(lat, lng, isSilent = false) {
      const tempEl = document.getElementById('prayerTempVal');
      const iconEl = document.getElementById('prayerWeatherIcon');
      const badgeEl = document.getElementById('prayerWeatherBadge');
      if (!tempEl || !iconEl || !badgeEl) return;

      const numLat = parseFloat(lat);
      const numLng = parseFloat(lng);
      if (!isFinite(numLat) || !isFinite(numLng) || numLat < -90 || numLat > 90 || numLng < -180 || numLng > 180) {
        return;
      }

      const cacheKey = numLat.toFixed(2) + ',' + numLng.toFixed(2);
      const now = Date.now();
      if (weatherCache[cacheKey] && (now - weatherCache[cacheKey].timestamp < 600000)) {
        const cached = weatherCache[cacheKey];
        tempEl.textContent = cached.temp + '°C';
        iconEl.className = cached.iconClass;
        badgeEl.setAttribute('aria-label', (IS_ARABIC ? 'درجة الحرارة الحالية: ' : 'Current temperature: ') + cached.temp + '°C');
        badgeEl.title = (IS_ARABIC ? 'درجة الحرارة الحالية: ' : 'Current temperature: ') + cached.temp + '°C';
        badgeEl.style.opacity = '1';
        lastWeatherFetchTimestamp = cached.timestamp;
        return;
      }

      const reqId = ++activeWeatherRequestId;
      if (!isSilent) {
        badgeEl.style.opacity = '0.75';
      }

      try {
        const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + encodeURIComponent(numLat.toFixed(4)) + '&longitude=' + encodeURIComponent(numLng.toFixed(4)) + '&current=temperature_2m,weather_code';
        const res = await fetch(url);
        if (reqId !== activeWeatherRequestId) return;

        if (!res.ok) {
          badgeEl.style.opacity = '1';
          return;
        }

        const data = await res.json();
        if (reqId !== activeWeatherRequestId) return;

        if (data && data.current && typeof data.current.temperature_2m === 'number') {
          const tempC = Math.round(data.current.temperature_2m);
          const iconClass = mapWmoToWeatherIcon(data.current.weather_code);

          weatherCache[cacheKey] = {
            temp: tempC,
            iconClass: iconClass,
            timestamp: now
          };

          if (tempEl) tempEl.textContent = tempC + '°C';
          if (iconEl) iconEl.className = iconClass;
          if (badgeEl) {
            badgeEl.setAttribute('aria-label', (IS_ARABIC ? 'درجة الحرارة الحالية: ' : 'Current temperature: ') + tempC + '°C');
            badgeEl.title = (IS_ARABIC ? 'درجة الحرارة الحالية: ' : 'Current temperature: ') + tempC + '°C';
          }
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
          if (badgeEl) badgeEl.style.opacity = '1';
        }
      }
    }

    async function fetchIPLocationFallback(initLat, initLng, initLabel, initTz) {
          let ipDetected = false;
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            const ipRes = await fetch('https://ipapi.co/json/', { cache: 'no-cache', signal: controller.signal });
            clearTimeout(timeoutId);
            if (ipRes.ok) {
              const ipData = await ipRes.json();
              if (ipData && ipData.latitude && ipData.longitude) {
                // Protect manual city selection from delayed IP responses
                  if (typeof currentLocationIntent !== 'undefined' && currentLocationIntent !== 'auto') return;

                  const ipLat = parseFloat(ipData.latitude);
                const ipLng = parseFloat(ipData.longitude);
                const ipCity = ipData.city || (IS_ARABIC ? 'المنطقة المحلية' : 'Local Area');
                const ipCountry = ipData.country_name || (IS_ARABIC ? 'المملكة العربية السعودية' : 'Saudi Arabia');
                const ipLabel = IS_ARABIC ? `${ipCity}، ${ipCountry}` : `${ipCity}, ${ipCountry}`;
                const ipTz = ipData.timezone || 'Asia/Riyadh';
                ipDetected = true;
                await fetchPrayerForCoords(ipLat, ipLng, ipLabel, 'ip', ipTz, null);
              }
            }
          } catch (err) {
            console.warn('IP Geolocation fallback error:', err);
          }
          if (!ipDetected) {
              if (typeof currentLocationIntent !== 'undefined' && currentLocationIntent !== 'auto') return;
              await fetchPrayerForCoords(initLat, initLng, initLabel, 'default', initTz, 'riyadh');
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



