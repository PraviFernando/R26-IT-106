# Postpartum Exercise Module: Clinical Rules, Thresholds and Model

This document explains **how the exercise module decides what a mother may do**, and **why** each
threshold has the value it has. Code values live in:

- `backend/config/exerciseConfig.js` (server rules)
- `frontend/utils/exerciseConfig.js` (app rules)

Keep this document in sync when a value changes.

> **Important:** The rules below are a decision-support aid built for a research prototype. They do
> not replace a doctor's or midwife's advice, and the app always tells the user to follow medical advice
> when a restriction applies. Values marked **design choice** are project decisions and should be
> confirmed with a clinician before any real deployment.

---

## 1. How a recommendation is made

```
Daily health form  ─┐
Latest EPDS risk   ─┼─► ML model (Random Forest) ─► exercise category 1–4
                    │       (rule fallback if the ML API is down)
                    │
                    ▼
        Diary mood rule      (sad mood → one level lower)
        Last-session rule    (pain / Hard / low adherence → one level lower)
        Clinical safety caps (always applied last, can only lower the level)
                    │
                    ▼
        Personalisation from movement tracking (video ordering only)
                    │
                    ▼
        10 YouTube videos: category search + up to 2 "focus" searches from the form
        (C-section, pelvic/back/core, low energy, mood, limited mobility)
        (static list for the category if YouTube fails)
```

Categories:

| Category | Name | Typical content |
|---|---|---|
| 1 | Bedrest / Breathing | Diaphragmatic breathing, pelvic-floor activation lying down |
| 2 | Gentle Mobility | Stretching, gentle range-of-motion, light walking |
| 3 | Strength & Core | Low-impact core and strength work |
| 4 | Full Functional | Full postpartum workouts |

**Safety principle:** the ML model proposes a level. Safety rules can **only lower** it, never raise it.

---

## 2. Exercise level rules (used to label the training data and by the fallback)

These rules decide the category from **every** field on the health form. The ML training labels are
produced by `ml_training/relabel_dataset.py` with these rules, and `backend/services/mlPredictionService.js`
(`fallbackPrediction`) implements the same rules (checked: 0 mismatches on all 6,000 training rows).

**Step 1 – Hard stops → category 1 (rest and breathing only):** doctor restriction, bleeding
complications, 3 or more of {pelvic pain, back pain, abdominal pain, muscle weakness}, or ≤ 2 weeks after delivery.

**Step 2 – Base level from recovery time:** 3–5 weeks → 2, 6–7 weeks → 3, 8+ weeks → 4.

**Step 3 – Caps (category ≤ 2):** C-section before 6 weeks; exactly 2 symptoms; high fatigue; very limited mobility.

**Step 4 – Milder factors (−1 level each, at most −2 in total, never below 2):** one symptom; medium
fatigue; limited mobility; low willingness to exercise; high EPDS (depression screening) risk.

**Risk:** High if doctor restriction, bleeding or 3+ symptoms. Medium if ≤ 2 weeks, 2 symptoms, high fatigue,
very limited mobility, high EPDS risk, or C-section before 6 weeks. Otherwise Low.

Examples (10 weeks after a normal delivery): no issues → 4; back pain → 3; medium fatigue → 3; back pain +
medium fatigue → 2; high fatigue → 2; bleeding → 1.

## 2b. Clinical safety rules (applied again after the ML prediction)

These are applied to the model's answer as a final safety net, so a wrong prediction can never
recommend harder exercise than these rules allow.

| Rule | Condition | Result | Reason |
|---|---|---|---|
| Doctor restriction | `doctorRestrictions = true` | Status **blocked**, **no videos** recommended or stored | A clinician's instruction always overrides the app. |
| Bleeding complications | `bleedingComplications = true` | Category **1**, status limited | Abnormal postpartum bleeding needs medical review before exercising; breathing only. |
| Early C-section | C-section and weeks < **6** (`C_SECTION_RECOVERY_WEEKS`) | Category **≤ 2**, status limited | Abdominal surgery recovery. Common guidance is to wait for the ~6-week postnatal check before more strenuous exercise (see refs 1–2). |
| Severe symptoms | ≥ **3** of pelvic pain, back pain, abdominal pain, muscle weakness (`SEVERE_SYMPTOM_COUNT`) | Category **1** | Several concurrent pain/weakness symptoms → rest and breathing only. **Design choice.** |
| Moderate symptoms / low capacity | Exactly **2** symptoms (`MODERATE_SYMPTOM_COUNT`), or high fatigue, or very limited mobility | Category **≤ 2** | Reduce intensity when capacity is reduced. **Design choice.** |

## 3. Daily adaptation rules

| Rule | Condition | Result | Value source |
|---|---|---|---|
| Diary mood | Today's diary detected as *sad* | Category − 1 (min 1) | Design choice. Gentle activity is still encouraged because exercise is associated with reduced postpartum depressive symptoms (ref 4). |
| Previous session | Last record had pain = Yes, difficulty = Hard, or adherence < **50%** (`LOW_ADHERENCE_PERCENT`) | Category − 1 (min 1) | Design choice: below half the planned time is treated as "could not complete". |

## 4. Personalisation from movement tracking

Uses the last **3** completed movement sessions (`PERSONALISE_SESSION_COUNT`). It only changes the **order** of videos (longer or shorter first), never the safety category.

| Condition | Result |
|---|---|
| All 3 sessions: score ≥ **90** and accuracy ≥ **90**, rated Easy (`HIGH_PERFORMANCE_SCORE`) | Longer videos first, with an encouragement message |
| Last session: score < **70** or accuracy < **70**, or pain, or Hard (`LOW_PERFORMANCE_SCORE`) | Shorter / gentler videos first, with a supportive message |

The 90 and 70 values are **design choices** that match the score bands shown to the user on the movement summary (≥90 "Excellent", ≥70 "Good").

## 4b. Camera movement scores (frontend/utils/movementScoring.js)

All scores come from the user's own pose. Earlier versions compared the user with a fixed 6-second timer,
which penalised correct movement done at the user's own pace, and reported steadiness only for Bird Dog.

| Score | How it is measured |
|---|---|
| Accuracy | 50% range of motion (share of the exercise's target range reached, e.g. squat knee 170°→105°, bridge hip 125°→170°, Cat-Cow 25° spine range) + 50% posture. Smoothed. Each finished rep is scored the same way; 70+ counts as a correct rep. |
| Posture | Exercise-specific alignment checks: knees over ankles (squat), knees hip-width (bridge), wrists under shoulders (Cat-Cow), straight reaching arm and leg (Bird Dog), level hips/shoulders. |
| Steadiness | Hip tilt and side-to-side pelvis sway over the last ~3 seconds, relative to torso length, for every exercise. |
| Pace | Seconds per rep vs a slow, controlled tempo (about 3–7 s; 4–9 s for Cat-Cow), from the 2nd rep on. Replaces "video match": the poses inside a YouTube video cannot be measured, so the app does not claim to compare against them. |

## 5. Completion and adherence

| Value | Meaning | Where |
|---|---|---|
| **80%** watched (`WATCH_COMPLETE_PERCENT`) | Video counts as completed | Backend + app. Design choice: allows for intros/outros and cool-downs that users often skip. |
| Adherence = actual stopwatch minutes ÷ recommended minutes × 100, **capped at 100%** | Shown in results and used by rule 3 | Backend `saveExerciseRecord` |
| Movement session complete: ≥ **5** reps, or ≥ **1** rep over ≥ **60 s** of tracking | Prevents "completion" just by waiting | `frontend/utils/exerciseConfig.js` |
| Videos ≤ **60 s** excluded (`MIN_VIDEO_SECONDS`) | Removes YouTube Shorts | Backend |

## 6. Progress analytics

| Item | Rule |
|---|---|
| Current streak | Consecutive days with a completed exercise, counted back from today. If today is not done yet, a streak ending yesterday still counts. |
| Missed sessions | Days without a completed exercise in the last 7 days (excluding today). |
| Weekly rate | Distinct completed days in the last 7 days ÷ 7. |
| Daily score | Video accuracy, else stopwatch adherence (100 if none). Pain −15, Hard −10 (min 20), feeling "Better" +5 (max 100). Averaged per day. **Design choice.** |
| Recovery trend | Compares fatigue and mobility in the first vs. last third of the past **21 days** of health logs (needs ≥ 3 logs). |

All dates use the **local** calendar date (Sri Lanka, UTC+5:30), not UTC.

---

## 7. The ML model

### Why the model was retrained (October 2026)

In the original labels the category depended almost only on weeks after delivery. For example, after 8 weeks,
43 of 45 rows **with bleeding** were labelled category 3–4. The first model therefore ignored pain, fatigue,
mobility, willingness and even bleeding: changing the health form did not change the exercises. The labels
were recomputed with the rules in section 2, and synthetic rows were added because the original file has
unrealistic rates (e.g. 36% bleeding), which would leave almost no examples of categories 3–4.

### Model details

**Files:** `ml_training/train_exercise_model.py` (training), `ml_training/predict_api.py` (Flask API on port 5001), `backend/services/mlPredictionService.js` (client + fallback).

**Data:** `ml_training/new_dataset_relabelled.xlsx`, created by `relabel_dataset.py`:
1,000 original rows (features unchanged, targets relabelled) + 5,000 synthetic rows (seeded, realistic rates:
5% bleeding, 5% doctor restriction, 30% C-section, 20–25% each pain, weeks 1–24). 998 exact duplicates are removed,
leaving 5,002 rows. Split is 80/20, stratified by category.

**Features (in order):** weeks after delivery, delivery type, pelvic pain, back pain, abdominal pain, bleeding,
doctor restrictions, muscle weakness, fatigue level, mobility level, willingness, EPDS risk level.

**Targets:** `target_risk_score` 0 = Low, 1 = Medium, 2 = High; `target_exercise_category` 1–4.

**Model:** multi-output Random Forest (300 trees, min 2 samples per leaf, balanced class weights), standard-scaled inputs.

### Results (held-out test set, 1,001 rows)

| Target | Accuracy | Macro F1 | 5-fold CV accuracy | Majority-class baseline |
|---|---|---|---|---|
| Exercise category | **99.3%** | 0.99 | 98.9% ± 0.3 | 61.0% |
| Risk score | **98.6%** | 0.99 | 99.6% ± 0.2 | 48.2% |

**Every input now changes the result** (10 weeks, normal delivery, otherwise healthy = category 4):
weeks 1→1, 3→2, 6→3, 8→4; fatigue medium→3, high→2; mobility limited→3, very limited→2; willingness low→3;
EPDS high→3; any single pain or muscle weakness→3; bleeding or doctor restriction→1.

**Most important features:** bleeding (0.18), fatigue (0.14), weeks after delivery (0.13), doctor restrictions (0.12),
mobility (0.09), then the pain items, EPDS and willingness (0.05–0.06 each).

**How to read these numbers honestly:**
- The labels come from explicit rules, so very high accuracy is expected. It shows the model learned the
  clinical rules (including combinations of factors). It does **not** show clinical validity.
- The rule fallback agrees with the test labels 100% (`reports/fallback_comparison.json`), so the app gives the
  same level whether or not the ML API is running. The model's value is that it can later be retrained on real,
  clinician-labelled data without changing the app.
- All data is project-generated (original file and synthetic rows); none is from real patients.

Charts and full numbers: `ml_training/reports/` (`metrics.json`, `confusion_matrices.png`,
`feature_importance.png`, `fallback_comparison.json`).

## 7b. How videos follow the form

`backend/utils/exerciseVideoQueries.js` builds the YouTube searches. The category search always runs. Up to
**2 focus searches** are added, in this priority order: C-section (< 12 weeks), pelvic pain, back pain,
abdominal pain or muscle weakness (category ≥ 2), medium/high fatigue or low willingness, high EPDS or sad
diary mood, limited mobility. Each focus search uses the category's intensity wording (e.g. category 1 →
"breathing exercises in bed"), so it can never suggest harder exercise. Up to **3 videos per focus search** are shown
first and labelled on the card (e.g. "🎯 For back pain"); the rest come from the category search.

### YouTube quota, cache and saved videos

The YouTube Data API allows 10,000 units a day and one search costs 100. To keep the app working when the
quota runs out:

1. **Cache.** Each search is stored for 24 hours (`YOUTUBE_CACHE_HOURS`, collection `youtubesearchcaches`), so a
   mother submitting the form again, or another mother with the same answers, uses no quota.
2. **Older copy.** If YouTube refuses a request (for example HTTP 429, quota used up), the last cached copy is used,
   up to 7 days old.
3. **Saved videos.** If the list is still shorter than 10 (key missing, quota used up with no cache, or only some of
   the searches worked), it is topped up from the saved list for the category (`type: youtube_fallback`).
   The saved list has no repeated videos, and when a category has too few different videos, gentler categories
   are used, never a harder one.
4. A doctor-restricted user never gets videos, whatever happens with YouTube.

### Running it

```bash
cd ml_training
py -m venv .venv
.venv\Scripts\pip install -r requirements.txt
.venv\Scripts\python relabel_dataset.py          # creates new_dataset_relabelled.xlsx
.venv\Scripts\python train_exercise_model.py      # creates exercise_model.pkl, scaler.pkl, reports/
.venv\Scripts\python predict_api.py               # serves http://127.0.0.1:5001
```

If the API is not running, the backend uses `fallbackPrediction` and marks the result
`predictionSource: "rule_fallback"`; the app then shows a notice above the recommendations.

---

## 8. References (check the exact section/page before citing in the thesis)

1. ACOG Committee Opinion No. 804, *Physical Activity and Exercise During Pregnancy and the Postpartum Period* (2020). Gradual return to activity after delivery, individualised after caesarean or complications.
2. NHS, *Your post-pregnancy body / Exercise after pregnancy*. Wait for the 6-week postnatal check before high-impact exercise; longer after a caesarean.
3. WHO, *Guidelines on physical activity and sedentary behaviour* (2020). Postpartum women: at least 150 min/week moderate activity when medically cleared.
4. Poyatos-León R. et al., *Effects of exercise-based interventions on postpartum depression: a meta-analysis of randomized controlled trials*, Birth (2017).
5. Cox J.L., Holden J.M., Sagovsky R., *Detection of postnatal depression: development of the 10-item Edinburgh Postnatal Depression Scale*, Br J Psychiatry (1987). Basis of the EPDS screening used as a model input.
