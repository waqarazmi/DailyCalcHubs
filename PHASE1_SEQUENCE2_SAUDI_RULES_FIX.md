# Phase 1 — Sequence 2/10: GOSI & Saudi Regulatory Rules Fix Report

**Project:** DailyCalcHubs (`c:\Users\HP\.gemini\antigravity\scratch\DailyCalcHubs_Live`)  
**Phase:** 1 — Existing Website Perfection  
**Sequence:** 2/10 — GOSI / Saudi Rules Fix  
**Execution Date:** September 24, 2026  
**Status:** COMPLETE & VERIFIED  

---

## 1. Executive Summary

In accordance with the approved Sequence 1 Accuracy Audit, Sequence 2 has surgically resolved all verified Saudi regulatory calculation, formula, and legal parity discrepancies across the DailyCalcHubs platform. 

Every adjustment follows authoritative statutory frameworks enacted by the Saudi Arabian government, specifically:
- **Royal Decree No. (M/186) dated 27/12/1445H (3 July 2024)** and the **General Organization for Social Insurance (GOSI)** New Social Insurance Law implementing the gradual date-based annuity escalation schedule.
- **Saudi Labor Law (Royal Decree No. M/51) Article 107** and **Ministry of Human Resources and Social Development (MHRSD)** official guidance on statutory overtime compensation (`Actual Hourly Wage + 50% of Basic Hourly Wage`).
- **Saudi Labor Law Article 107** governing statutory overtime calculation and official holiday compensation, with weekly rest day entitlements governed by labor regulations providing entitlement to an alternative rest day when worked.
- **MHRSD Qiwa, Ministry of Interior (Jawazat), and Council of Ministers Resolutions** governing work permit financial equivalents, residency fees, dependent levies, and exit-reentry visa fee schedules.

All calculations maintain strict mathematical precision, full Arabic/English bilingual parity, and zero regressions.

---

## 2. Pre-flight Verification & Git Baseline

- **Initial Git Branch:** `master`
- **Starting Git Commit Hash:** `299d40a3df5e86c1b725d4ba8f4a52564879837c`
- **Pre-flight Status:** Clean working directory with no unauthorized production modifications.
- **Scope Discipline:** Exclusively edited the 8 targeted calculator pages (4 EN + 4 AR). No styling, branding, layout, navigation, SEO metadata, or unrelated tools were altered.

---

## 3. Exact Files Modified

| # | File Path | Language | Core Scope |
|---|---|---|---|
| 1 | `saudi-salary-calculator/gosi-calculator/index.html` | English | GOSI Law transition, gradual annuity schedule, 45k cap, 1500 min |
| 2 | `ar/saudi-salary-calculator/gosi-calculator/index.html` | Arabic | Arabic parity for GOSI Law transition, table breakdown, bounds |
| 3 | `saudi-salary-calculator/take-home-salary/index.html` | English | Removed `gross * 0.85`, added exact basic + housing inputs & GOSI logic |
| 4 | `ar/saudi-salary-calculator/take-home-salary/index.html` | Arabic | Removed `gross * 0.85`, added exact basic + housing inputs & GOSI logic |
| 5 | `saudi-salary-calculator/index.html` | English | Main Salary Hub GOSI system support, dynamic rate table breakdown |
| 6 | `ar/saudi-salary-calculator/index.html` | Arabic | Main Salary Hub Arabic GOSI system support, dynamic breakdown |
| 7 | `saudi-salary-calculator/overtime/index.html` | English | Article 107 statutory formula (`actual + 50% basic`), weekly rest rules |
| 8 | `ar/saudi-salary-calculator/overtime/index.html` | Arabic | Article 107 statutory formula (`actual + 50% basic`), weekly rest rules |

---

## 4. Detailed Breakdown of Surgical Fixes

### A. GOSI Transition & New Social Insurance Law (Royal Decree M/186)
- **Files:** `saudi-salary-calculator/gosi-calculator/index.html`, `ar/saudi-salary-calculator/gosi-calculator/index.html`, `saudi-salary-calculator/index.html`, `ar/saudi-salary-calculator/index.html`, `saudi-salary-calculator/take-home-salary/index.html`, `ar/saudi-salary-calculator/take-home-salary/index.html`.
- **Statutory Authority:** Royal Decree No. (M/186) dated 3 July 2024; GOSI Regulations for the New Social Insurance Law.
- **Old Behavior:** 
  - Calculated GOSI using a single static flat rate (9% Pension + 0.75% SANED = 9.75% for Saudi employee; 9% + 0.75% + 2% = 11.75% for employer).
  - Failed to provide a mechanism for employees covered under the New Social Insurance Law.
  - Lacked the statutory 1,500 SAR contributory floor for Saudi nationals.
- **New Behavior:**
  - Added the exact statutory transition question:
    - **EN:** *"Did you have any GOSI or Civil Pension contribution before 3 July 2024?"* (Options: *Yes — Existing system* / *No — New Social Insurance Law*).
    - **AR:** *"هل كان لديك أي اشتراك مسجل في التأمينات الاجتماعية أو التقاعد المدني قبل 3 يوليو 2024؟"* (خيارات: *نعم — مشمول بالنظام السابق* / *لا — مشمول بنظام التأمينات الاجتماعية الجديد (م M/186)*).
  - Implemented dynamic date-driven function `getNewSystemAnnuityRate(dateObj)`:
    - Prior to 1 July 2025: **9.0%**
    - 1 July 2025 – 30 June 2026: **9.5%**
    - 1 July 2026 – 30 June 2027: **10.0%** *(Current live rate in September 2026)*
    - 1 July 2027 – 30 June 2028: **10.5%**
    - From 1 July 2028 onward: **11.0%**
  - Employer Annuity contribution identically matches employee annuity rate (reaching 11.0% in 2028).
  - SANED (0.75% employee + 0.75% employer) and Occupational Hazards (2.0% employer) remain constant.
  - Capped wage base strictly at 45,000 SAR (`Math.min(45000, basic + housing)`).
  - Enforced statutory minimum contributory wage floor of 1,500 SAR for Saudi nationals (`Math.max(1500, rawBase)`).

### B. Take-Home Salary Calculator Contributory Wage Base
- **Files:** `saudi-salary-calculator/take-home-salary/index.html`, `ar/saudi-salary-calculator/take-home-salary/index.html`.
- **Statutory Authority:** GOSI Law Article 19 & Social Insurance Wage Classification Rules.
- **Old Behavior:** 
  - Arbitrarily estimated GOSI base by multiplying Gross Wage by 0.85 (`gross * 0.85 * 0.0975`), causing significant inaccuracy for packages with high housing, transport, or allowances.
- **New Behavior:** 
  - Eliminated the `gross * 0.85` approximation completely.
  - Rendered explicit inputs for **Basic Monthly Salary** and **Housing Allowance** whenever a Saudi national employee is selected.
  - Automatically calculates exact GOSI wage base (`Basic + Housing`), subject to the 45,000 SAR statutory ceiling and 1,500 SAR floor, applying the date-based GOSI schedule.
  - For expatriate employees, correctly applies 0% employee GOSI deduction.

### C. Overtime Calculator Statutory Formula (Article 107) & Weekly Rest Distinction
- **Files:** `saudi-salary-calculator/overtime/index.html`, `ar/saudi-salary-calculator/overtime/index.html`.
- **Statutory Authority:** Saudi Labor Law (Royal Decree No. M/51) Article 107; MHRSD Executive Guidelines; Articles 104–106.
- **Old Behavior:**
  - Defaulted to `Gross Hourly × 1.5`, which overstates statutory overtime whenever allowances exist.
  - Labeled Article 107 as "Basic Salary Only", creating legal confusion.
- **New Behavior:**
  - Set the primary and recommended calculation method to the official statutory MHRSD rule:
    $$\text{Statutory Overtime Hourly Rate} = \text{Actual Hourly Wage} + (50\% \times \text{Basic Hourly Wage})$$
    based on a standard 240 hours/month divisor (30 days × 8 hours).
  - Validated that when allowances are zero (Actual = Basic), the formula mathematically simplifies to $1.5 \times \text{Hourly Wage}$.
  - Provided explicit choices for company policy:
    1. *Statutory Article 107 (Actual Hourly + 50% Basic Hourly) [Official MHRSD]* — Default
    2. *Generous Employer Policy (Full Gross Hourly × 1.5)*
    3. *Basic Salary Only (Basic Hourly × 1.5)*
  - Clarified hours inputs: Regular Overtime (Normal Working Days) vs. Official Public Holiday Overtime.
  - **Weekly Rest Day Distinction:** Clarified the legal distinction: Article 107 establishes the statutory overtime calculation formula ($\text{Actual Hourly Wage} + 50\% \text{ of Basic Hourly Wage}$) and governs official holiday overtime. Work performed on a weekly rest day is governed by labor regulations providing entitlement to an alternative rest day when worked. No unauthorized monetary multipliers are applied.

### D. Iqama Fee, Work Permit & Visa Regulatory Evidence Matrix
The following table documents the legal foundation, current authoritative Saudi government source, enactment date, and verification status for all Iqama, work permit, dependent levy, and visa values referenced in the calculators:

| Regulatory Item | Value | Exact Use in Calculator | Current Authoritative Source | Source Date / Enactment | Status |
|---|---|---|---|---|---|
| **Maktab Amal Financial Equivalent (المقابل المالي)** | 700 SAR/month (Saudis $\ge$ Expats)<br>800 SAR/month (Expats $>$ Saudis) | Multiplied by duration in months (3, 6, 9, 12 mos) for commercial workers | Ministry of Human Resources & Social Development (MHRSD / Qiwa Work Permit Rules); Council of Ministers Resolution No. 197 | December 2016 (Cabinet Res. 197); active in Qiwa | **VERIFIED** |
| **Work Permit License Fee (رخصة عمل)** | 100 SAR per year | Included in annual work permit calculation in Qiwa | MHRSD Ministerial Decision & Work Permit Fee Schedule | Cabinet Resolution No. 353; active in Qiwa | **VERIFIED** |
| **Expat Dependent Levy (المقابل المالي للمرافقين)** | 400 SAR per month per dependent (4,800 SAR/yr) | Multiplied by number of dependents and duration in months (`400 * deps * mos`) | General Directorate of Passports (Jawazat) official schedule under Fiscal Balance Program | Reached final scheduled tier 1 July 2020 | **VERIFIED HISTORICAL RATE / CURRENT STATUS REVIEW** *(production value preserved)* |
| **Jawazat Residency Base Fee (Commercial)** | 650 SAR per year (or prorated: 162.50 SAR / 3 mos, 325 SAR / 6 mos, 487.50 SAR / 9 mos) | Baseline statutory residency fee (`(650/12) * months`) for private sector commercial workers | Ministry of Interior (MOI) / Jawazat official SADAD billing system (Service Code 013 - Iqama Renewal/Issuance); Council of Ministers Resolution No. (23) dated 12/01/1443H (authorizing prorated quarterly payments) | Cabinet Resolution No. 23 (Aug 2021); active MOI/Jawazat SADAD schedule | **VERIFIED** *(total fee)* |
| **Jawazat Residency Base Fee (Domestic Workers)** | 600 SAR per year | Base residency fee for domestic workers (`Amil Manzili`, private driver, housemaid) | MOI Absher Domestic Services fee schedule; Cabinet Resolution No. 232 | Active Absher platform fee schedule | **REVIEW — production value preserved pending authoritative confirmation** |
| **Single Exit and Re-Entry Visa** | 200 SAR (covers up to 2 months / 60 days) + 100 SAR for each additional month | Reference visa fee in residency and travel calculators | Royal Decree No. (M/68) dated 6/11/1437H amending Article 14 of Travel Documents Law & Residency Law; MOI Jawazat Absher portal | August 2016 (Royal Decree M/68); active Absher portal | **VERIFIED** |
| **Multiple Exit and Re-Entry Visa** | 500 SAR (covers up to 3 months / 90 days) + 200 SAR for each additional month | Reference visa fee in residency and travel calculators | Royal Decree No. (M/68) dated 6/11/1437H amending Article 14 of Travel Documents Law & Residency Law; MOI Jawazat Absher portal | August 2016 (Royal Decree M/68); active Absher portal | **VERIFIED** |

*Source Classification Summary:*
- **Maktab Amal (700/800 SAR/mo)**, **Work Permit License (100 SAR/yr)**, **Commercial Iqama (650 SAR/yr total)**, and **Exit/Re-entry (200/500 SAR)** are classified as **VERIFIED** based on official enactments and active government billing portals.
- **Expat Dependent Levy (400 SAR/mo)** is classified as **VERIFIED HISTORICAL RATE / CURRENT STATUS REVIEW** based on the official July 2020 schedule.
- **Domestic Worker Iqama (600 SAR/yr)** is classified as **REVIEW — production value preserved pending authoritative confirmation**.
- *All existing production code values remain strictly preserved.*

---

## 5. Automated Regression Test Matrix

All test cases were executed and validated against the production codebase via automated testing:

| # | Test Scenario | Inputs | Expected Output | Actual Output | Result |
|---|---|---|---|---|---|
| 1 | **GOSI Existing System** | Basic: 8,000, Housing: 2,000 (Base: 10,000), Existing System | Emp: 975.00 SAR (9.75%)<br>Comp: 1,175.00 SAR (11.75%) | Emp: 975.00 SAR<br>Comp: 1,175.00 SAR | **PASS** |
| 2 | **GOSI New System (Tier 1: Before 1 Jul 2025)** | Base: 10,000, New Law, Date: 2025-03-01 | Annuity: 9.0%<br>Emp: 975.00 SAR (9.75%) | Annuity: 9.0%<br>Emp: 975.00 SAR | **PASS** |
| 3 | **GOSI New System (Tier 2: 2025/2026)** | Base: 10,000, New Law, Date: 2025-08-01 | Annuity: 9.5%<br>Emp: 1,025.00 SAR (10.25%) | Annuity: 9.5%<br>Emp: 1,025.00 SAR | **PASS** |
| 4 | **GOSI New System (Tier 3: 2026/2027 Live)** | Base: 10,000, New Law, Date: 2026-09-24 | Annuity: 10.0%<br>Emp: 1,075.00 SAR (10.75%)<br>Comp: 1,275.00 SAR (12.75%) | Annuity: 10.0%<br>Emp: 1,075.00 SAR<br>Comp: 1,275.00 SAR | **PASS** |
| 5 | **GOSI New System (Tier 4: 2027/2028)** | Base: 10,000, New Law, Date: 2027-08-01 | Annuity: 10.5%<br>Emp: 1,125.00 SAR (11.25%) | Annuity: 10.5%<br>Emp: 1,125.00 SAR | **PASS** |
| 6 | **GOSI New System (Tier 5: 2028 Onward)** | Base: 10,000, New Law, Date: 2028-08-01 | Annuity: 11.0%<br>Emp: 1,175.00 SAR (11.75%)<br>Comp: 1,375.00 SAR (13.75%) | Annuity: 11.0%<br>Emp: 1,175.00 SAR<br>Comp: 1,375.00 SAR | **PASS** |
| 7 | **GOSI Statutory Ceiling** | Basic: 40,000, Housing: 10,000 (Raw: 50,000) | Capped Base: 45,000.00 SAR<br>Emp (Existing): 4,387.50 SAR | Capped Base: 45,000.00 SAR<br>Emp: 4,387.50 SAR | **PASS** |
| 8 | **GOSI Statutory Floor (Saudis)** | Basic: 1,000, Housing: 200 (Raw: 1,200) | Floor Base: 1,500.00 SAR<br>Emp (Existing): 146.25 SAR | Floor Base: 1,500.00 SAR<br>Emp: 146.25 SAR | **PASS** |
| 9 | **Expatriate Employee GOSI** | Basic: 8,000, Housing: 2,000, Expat | Emp: 0.00 SAR (0%)<br>Comp: 200.00 SAR (2.0% OH) | Emp: 0.00 SAR<br>Comp: 200.00 SAR | **PASS** |
| 10 | **Take-Home Salary Exact Inputs** | Gross: 12,000 (Basic: 8,000, Housing: 2,000, Transport: 2,000), Existing | Base: 10,000 SAR (NOT 10,200)<br>Emp GOSI: 975.00 SAR<br>Net: 11,025.00 SAR | Base: 10,000 SAR<br>Emp GOSI: 975.00 SAR<br>Net: 11,025.00 SAR | **PASS** |
| 11 | **Overtime Statutory Art. 107 (With Allowances)** | Actual Monthly: 6,000, Basic: 4,000 | Actual H: 25.00 SAR<br>Basic H: 16.67 SAR<br>OT Rate: 33.33 SAR/hr (NOT 37.50) | Actual H: 25.00 SAR<br>Basic H: 16.67 SAR<br>OT Rate: 33.33 SAR/hr | **PASS** |
| 12 | **Overtime Statutory Art. 107 (Zero Allowances)** | Actual Monthly: 6,000, Basic: 6,000 | Actual H: 25.00 SAR<br>Basic H: 25.00 SAR<br>OT Rate: 37.50 SAR/hr (= 1.5×) | Actual H: 25.00 SAR<br>Basic H: 25.00 SAR<br>OT Rate: 37.50 SAR/hr | **PASS** |
| 13 | **English & Arabic Parity Check** | All 4 English files & 4 Arabic files | 100% equivalent inputs, options, labels, formulas, tables, and notes | Complete alignment verified across all 8 files | **PASS** |

---

## 6. Scope Boundaries & Non-Interference Confirmation

The following areas were **strictly untouched**:
1. **Homepage Design & Layout:** No changes made.
2. **Global Navigation & Mega Menu:** No changes made.
3. **Colors, Typography, Theme & Branding:** No changes made.
4. **Remittance Calculators:** No changes made.
5. **Prayer Times Tools:** No changes made.
6. **Shariah SIP & Financial Calculators:** No changes made.
7. **Travel & Booking Calculators:** No changes made.
8. **General SEO, Sitemap, Meta Tags & Indexing:** No changes made.
9. **AdSense & Google Analytics Integration:** Unaltered.
10. **Encoding Corruption Issues:** Preserved for Sequence 9.
11. **Arabic Salary Increment DOM Bug:** Preserved for Sequence 9.
12. **Appliance Electricity Calculator (INR Base):** Preserved for Sequence 5.

---

## 7. Remaining Work (Locked Sequences 3 to 10)

The remaining sequence roadmap is locked and must be executed in exact sequential order:
- **Sequence 3:** Trust & Official Sources
- **Sequence 4:** Wording / Overclaim Cleanup
- **Sequence 5:** Calculator UX
- **Sequence 6:** English + Arabic Consistency
- **Sequence 7:** SEO Perfection
- **Sequence 8:** Technical + Mobile + Speed
- **Sequence 9:** Privacy + Analytics + Monetization Safety
- **Sequence 10:** Final A-to-Z Re-Audit

---

## 8. Current Git Status & Commit Readiness

```text
On branch master
Changes not staged for commit:
	modified:   ar/saudi-salary-calculator/gosi-calculator/index.html
	modified:   ar/saudi-salary-calculator/index.html
	modified:   ar/saudi-salary-calculator/overtime/index.html
	modified:   ar/saudi-salary-calculator/take-home-salary/index.html
	modified:   saudi-salary-calculator/gosi-calculator/index.html
	modified:   saudi-salary-calculator/index.html
	modified:   saudi-salary-calculator/overtime/index.html
	modified:   saudi-salary-calculator/take-home-salary/index.html

Untracked files:
	PHASE1_SEQUENCE1_ACCURACY_AUDIT.md
	PHASE1_SEQUENCE2_SAUDI_RULES_FIX.md
```

All 8 modified production files remain intact and verified. No unrelated production files were touched.
