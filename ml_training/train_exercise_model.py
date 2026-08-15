import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, accuracy_score
import joblib

print("=" * 60)
print("Training Multi-output Exercise Model")
print("=" * 60)

# Load dataset
df = pd.read_excel('new_dataset.xlsx')
print(f"Dataset shape: {df.shape}")

# Define column groups
feature_cols = [
    'weeks_after_delivery', 'delivery_type', 'pelvic_pain', 'back_pain', 
    'abdominal_pain', 'bleeding', 'doctor_restrictions', 'muscle_weakness', 
    'fatigue_level', 'mobility_level', 'willingness'
]
target_cols = ['target_risk_score', 'target_exercise_category']

X = df[feature_cols].values
y = df[target_cols].values

print(f"Features (X) shape: {X.shape}")
print(f"Targets (y) shape: {y.shape}")

# Split dataset
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train multi-output RandomForestClassifier
print("\nTraining RandomForestClassifier...")
model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
model.fit(X_train_scaled, y_train)

# Evaluate model
y_pred = model.predict(X_test_scaled)

print("\n--- Evaluation on Test Set ---")
# Evaluate risk score target
risk_acc = accuracy_score(y_test[:, 0], y_pred[:, 0])
print(f"\n1. Target Risk Score Accuracy: {risk_acc:.4f}")
print("Classification Report:")
print(classification_report(y_test[:, 0], y_pred[:, 0], target_names=['High', 'Low', 'Medium'], labels=[0, 1, 2]))

# Evaluate exercise category target
cat_acc = accuracy_score(y_test[:, 1], y_pred[:, 1])
print(f"\n2. Target Exercise Category Accuracy: {cat_acc:.4f}")
print("Classification Report:")
print(classification_report(y_test[:, 1], y_pred[:, 1], target_names=['Bedrest', 'Gentle Mobility', 'Strength & Core', 'Full Functional'], labels=[1, 2, 3, 4]))

# Save artifacts
joblib.dump(model, 'exercise_model.pkl')
joblib.dump(scaler, 'scaler.pkl')

print("\nTraining complete! Saved artifacts:")
print("  - exercise_model.pkl")
print("  - scaler.pkl")
print("=" * 60)