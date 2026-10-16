"""
Relabel new_dataset.xlsx with clinically consistent targets.

Why: in the original labels the exercise category depended almost only on weeks after delivery
(e.g. after 8 weeks, 43 of 45 rows WITH bleeding were labelled category 3-4). A model trained on
that ignores pain, fatigue, mobility, willingness and even bleeding.

The rules below are the same ones documented in docs/exercise-clinical-rules.md and mirrored by
backend/services/mlPredictionService.js (fallbackPrediction). The input features are unchanged;
only target_risk_score and target_exercise_category are recomputed.

Output: new_dataset_relabelled.xlsx (the original file is kept unchanged).
"""
import os

import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
EPDS_MAP = {'low': 0, 'medium': 1, 'moderate': 1, 'high': 2}

# Feature encodings (same as the API): fatigue 0 low/1 medium/2 high, mobility 0 very_limited/1 limited/2 normal,
# willingness 0 low/1 medium/2 high, delivery_type 1 = c-section, epds 0 low/1 medium/2 high


def label(row):
    weeks = int(row['weeks_after_delivery'])
    symptoms = int(row['pelvic_pain'] + row['back_pain'] + row['abdominal_pain'] + row['muscle_weakness'])
    fatigue, mobility, willingness = int(row['fatigue_level']), int(row['mobility_level']), int(row['willingness'])
    epds = EPDS_MAP.get(str(row['epds_risk_level']).lower(), 0)
    c_section = int(row['delivery_type']) == 1

    # Risk: 0 Low, 1 Medium, 2 High
    if row['doctor_restrictions'] or row['bleeding'] or symptoms >= 3:
        risk = 2
    elif weeks <= 2 or symptoms == 2 or fatigue == 2 or mobility == 0 or epds == 2 or (c_section and weeks < 6):
        risk = 1
    else:
        risk = 0

    # Hard stops: rest and breathing only
    if row['doctor_restrictions'] or row['bleeding'] or symptoms >= 3 or weeks <= 2:
        return risk, 1

    # Base level from recovery time
    category = 2 if weeks <= 5 else 3 if weeks <= 7 else 4

    # Caps
    if c_section and weeks < 6:
        category = min(category, 2)
    if symptoms == 2 or fatigue == 2 or mobility == 0:
        category = min(category, 2)

    # One-step reductions for milder factors, at most 2 levels in total.
    # Category 1 (bedrest/breathing) is reserved for the hard stops above, so the floor here is 2.
    reductions = sum([symptoms == 1, fatigue == 1, mobility == 1, willingness == 0, epds == 2])
    category -= min(reductions, 2)

    return risk, max(2, min(4, category))


def synthetic_rows(n, seed=42):
    """Synthetic mothers with more realistic condition rates than the original file
    (which has e.g. 36% bleeding complications), so every exercise level is represented.
    Rates are project assumptions for a balanced training set, not epidemiological estimates."""
    rng = np.random.default_rng(seed)
    yes = lambda p: (rng.random(n) < p).astype(int)
    return pd.DataFrame({
        'weeks_after_delivery': rng.integers(1, 25, n),             # 1-24 weeks
        'delivery_type': yes(0.30),                                  # c-section
        'pelvic_pain': yes(0.20),
        'back_pain': yes(0.25),
        'abdominal_pain': yes(0.15),
        'bleeding': yes(0.05),
        'doctor_restrictions': yes(0.05),
        'muscle_weakness': yes(0.20),
        'fatigue_level': rng.choice([0, 1, 2], n, p=[0.40, 0.40, 0.20]),
        'mobility_level': rng.choice([0, 1, 2], n, p=[0.10, 0.30, 0.60]),
        'willingness': rng.choice([0, 1, 2], n, p=[0.25, 0.40, 0.35]),
        'epds_risk_level': rng.choice(['low', 'medium', 'high'], n, p=[0.60, 0.25, 0.15]),
        'source': 'synthetic',
    })


def main():
    df = pd.read_excel(os.path.join(BASE_DIR, 'new_dataset.xlsx'))
    df['source'] = 'original'
    before = df[['target_risk_score', 'target_exercise_category']].copy()
    df = pd.concat([df, synthetic_rows(5000)], ignore_index=True)
    labels = df.apply(label, axis=1, result_type='expand')
    df['target_risk_score'] = labels[0].astype(int)
    df['target_exercise_category'] = labels[1].astype(int)

    original = df[df['source'] == 'original'].reset_index(drop=True)
    changed = (before['target_exercise_category'] != original['target_exercise_category']).mean()
    print(f'Original rows: category label changed for {changed:.1%}')
    print(f'Rows: {len(original)} original + {len(df) - len(original)} synthetic = {len(df)}')
    print('New category distribution:', df['target_exercise_category'].value_counts().sort_index().to_dict())
    print('New risk distribution:', df['target_risk_score'].value_counts().sort_index().to_dict())

    out = os.path.join(BASE_DIR, 'new_dataset_relabelled.xlsx')
    df.to_excel(out, index=False)
    print(f'Saved {out}')


if __name__ == '__main__':
    main()
