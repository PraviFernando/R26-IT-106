"""
Train the multi-output exercise model used by predict_api.py.

Inputs : new_dataset_relabelled.xlsx (created by relabel_dataset.py: original rows + synthetic rows,
         labelled with the clinical rules in docs/exercise-clinical-rules.md; 12 features, see FEATURE_COLS)
Outputs: exercise_model.pkl, scaler.pkl            (loaded by predict_api.py)
         reports/metrics.json                       (accuracy, CV, per-class reports, baseline)
         reports/confusion_matrices.png
         reports/feature_importance.png

Label meaning (checked against the data: every risk 2 row is category 1 / bedrest):
  target_risk_score       0 = Low, 1 = Medium, 2 = High
  target_exercise_category 1 = Bedrest/Breathing, 2 = Gentle Mobility, 3 = Strength & Core, 4 = Full Functional
"""
import json
import os

import joblib
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, ConfusionMatrixDisplay, f1_score
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.preprocessing import StandardScaler

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REPORT_DIR = os.path.join(BASE_DIR, 'reports')
os.makedirs(REPORT_DIR, exist_ok=True)

FEATURE_COLS = [
    'weeks_after_delivery', 'delivery_type', 'pelvic_pain', 'back_pain',
    'abdominal_pain', 'bleeding', 'doctor_restrictions', 'muscle_weakness',
    'fatigue_level', 'mobility_level', 'willingness', 'epds_encoded'
]
TARGET_COLS = ['target_risk_score', 'target_exercise_category']
RISK_LABELS = {0: 'Low', 1: 'Medium', 2: 'High'}
CATEGORY_LABELS = {1: 'Bedrest/Breathing', 2: 'Gentle Mobility', 3: 'Strength & Core', 4: 'Full Functional'}
RANDOM_STATE = 42

print('=' * 60)
print('Training Multi-output Exercise Model')
print('=' * 60)

DATA_FILE = os.path.join(BASE_DIR, 'new_dataset_relabelled.xlsx')
if not os.path.exists(DATA_FILE):
    raise SystemExit('new_dataset_relabelled.xlsx not found - run relabel_dataset.py first')
df = pd.read_excel(DATA_FILE)
print(f'Dataset shape: {df.shape}')

epds_map = {'low': 0, 'medium': 1, 'moderate': 1, 'high': 2}
df['epds_encoded'] = df['epds_risk_level'].str.lower().map(epds_map).fillna(0).astype(int)

# Exact duplicate rows would appear in both train and test and inflate accuracy
before = len(df)
df = df.drop_duplicates(subset=FEATURE_COLS + TARGET_COLS).reset_index(drop=True)
print(f'Removed {before - len(df)} duplicate rows -> {len(df)} rows')

X = df[FEATURE_COLS].values
y = df[TARGET_COLS].values

# Stratify on the exercise category so every class is in the test set
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y[:, 1]
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print('\nTraining RandomForestClassifier...')
model = RandomForestClassifier(n_estimators=300, min_samples_leaf=2, class_weight='balanced', random_state=RANDOM_STATE, n_jobs=-1)
model.fit(X_train_scaled, y_train)
y_pred = model.predict(X_test_scaled)

risk_acc = accuracy_score(y_test[:, 0], y_pred[:, 0])
cat_acc = accuracy_score(y_test[:, 1], y_pred[:, 1])
risk_f1 = f1_score(y_test[:, 0], y_pred[:, 0], average='macro')
cat_f1 = f1_score(y_test[:, 1], y_pred[:, 1], average='macro')

print('\n--- Evaluation on held-out test set (20%) ---')
print(f'Risk score accuracy: {risk_acc:.4f}  (macro F1 {risk_f1:.4f})')
print(classification_report(y_test[:, 0], y_pred[:, 0], labels=list(RISK_LABELS), target_names=list(RISK_LABELS.values()), zero_division=0))
print(f'Exercise category accuracy: {cat_acc:.4f}  (macro F1 {cat_f1:.4f})')
print(classification_report(y_test[:, 1], y_pred[:, 1], labels=list(CATEGORY_LABELS), target_names=list(CATEGORY_LABELS.values()), zero_division=0))

# 5-fold cross-validation per target (single-output models) for a more stable estimate
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
X_all_scaled = StandardScaler().fit_transform(X)
cv_scores = {}
for idx, name in enumerate(TARGET_COLS):
    scores = cross_val_score(
        RandomForestClassifier(n_estimators=300, min_samples_leaf=2, class_weight='balanced', random_state=RANDOM_STATE, n_jobs=-1),
        X_all_scaled, y[:, idx], cv=cv, scoring='accuracy'
    )
    cv_scores[name] = {'mean': round(float(scores.mean()), 4), 'std': round(float(scores.std()), 4)}
    print(f'5-fold CV {name}: {scores.mean():.4f} +/- {scores.std():.4f}')

# Baseline: always predict the most common class (the model must beat this to be useful)
majority = {name: int(pd.Series(y_train[:, idx]).mode()[0]) for idx, name in enumerate(TARGET_COLS)}
baseline = {name: round(float(accuracy_score(y_test[:, idx], np.full(len(y_test), majority[name]))), 4)
            for idx, name in enumerate(TARGET_COLS)}
print(f'Majority-class baseline: {baseline}')

# Confusion matrices
fig, axes = plt.subplots(1, 2, figsize=(13, 5))
for ax, idx, labels, title in [
    (axes[0], 0, RISK_LABELS, f'Risk score (acc {risk_acc:.2f})'),
    (axes[1], 1, CATEGORY_LABELS, f'Exercise category (acc {cat_acc:.2f})'),
]:
    cm = confusion_matrix(y_test[:, idx], y_pred[:, idx], labels=list(labels))
    ConfusionMatrixDisplay(cm, display_labels=list(labels.values())).plot(ax=ax, colorbar=False, cmap='Purples')
    ax.set_title(title)
    ax.tick_params(axis='x', rotation=30)
plt.tight_layout()
plt.savefig(os.path.join(REPORT_DIR, 'confusion_matrices.png'), dpi=120)
plt.close()

# Feature importance
importances = model.feature_importances_
order = np.argsort(importances)
plt.figure(figsize=(8, 5))
plt.barh(np.array(FEATURE_COLS)[order], importances[order], color='#7C3AED')
plt.title('Feature importance (Random Forest)')
plt.tight_layout()
plt.savefig(os.path.join(REPORT_DIR, 'feature_importance.png'), dpi=120)
plt.close()

metrics = {
    'rows_used': int(len(df)),
    'duplicates_removed': int(before - len(df)),
    'test_size': int(len(y_test)),
    'risk_score': {
        'accuracy': round(float(risk_acc), 4), 'macro_f1': round(float(risk_f1), 4),
        'labels': RISK_LABELS,
        'report': classification_report(y_test[:, 0], y_pred[:, 0], labels=list(RISK_LABELS), target_names=list(RISK_LABELS.values()), zero_division=0, output_dict=True),
    },
    'exercise_category': {
        'accuracy': round(float(cat_acc), 4), 'macro_f1': round(float(cat_f1), 4),
        'labels': CATEGORY_LABELS,
        'report': classification_report(y_test[:, 1], y_pred[:, 1], labels=list(CATEGORY_LABELS), target_names=list(CATEGORY_LABELS.values()), zero_division=0, output_dict=True),
    },
    'cross_validation_5fold': cv_scores,
    'majority_baseline_accuracy': baseline,
    'feature_importance': {f: round(float(i), 4) for f, i in sorted(zip(FEATURE_COLS, importances), key=lambda t: -t[1])},
}
with open(os.path.join(REPORT_DIR, 'metrics.json'), 'w', encoding='utf-8') as fh:
    json.dump(metrics, fh, indent=2)

# Held-out rows, so the backend's rule-based fallback can be compared on the same data
test_df = pd.DataFrame(X_test, columns=FEATURE_COLS)
test_df['target_risk_score'] = y_test[:, 0]
test_df['target_exercise_category'] = y_test[:, 1]
test_df.to_csv(os.path.join(REPORT_DIR, 'test_split.csv'), index=False)

joblib.dump(model, os.path.join(BASE_DIR, 'exercise_model.pkl'))
joblib.dump(scaler, os.path.join(BASE_DIR, 'scaler.pkl'))

print('\nTraining complete! Saved: exercise_model.pkl, scaler.pkl, reports/')
print('=' * 60)
