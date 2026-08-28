import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib
import json
import os

# Define the features mentioned by the user
FEATURES = [
    'emotional_indicators',
    'sleep_quality',
    'stress_level',
    'activity_level',
    'anxiety_level',
    'appetite_changes',
    'bonding_with_baby',
    'crying_frequency',
    'concentration_difficulty',
    'epds_total_score'
]
TARGET = 'depression_risk'

def generate_dummy_data(n=3000):
    """Generate 3000 records of dummy data for training since the actual dataset wasn't provided directly in text."""
    np.random.seed(42)
    data = pd.DataFrame()
    for feature in FEATURES[:-1]:
        # Generate random scores between 0 and 3 for EPDS-like questions
        data[feature] = np.random.randint(0, 4, size=n)
    
    # EPDS total score is roughly the sum of the other features
    data['epds_total_score'] = data[FEATURES[:-1]].sum(axis=1)
    
    # Introduce some missing values to test the imputer
    for feature in FEATURES:
        mask = np.random.rand(n) < 0.05
        data.loc[mask, feature] = np.nan
        
    # Generate target based on epds_total_score (Simplified logic for dummy data)
    conditions = [
        (data['epds_total_score'] < 10),
        (data['epds_total_score'] >= 10) & (data['epds_total_score'] < 13),
        (data['epds_total_score'] >= 13)
    ]
    choices = ['Low', 'Moderate', 'High']
    data[TARGET] = np.select(conditions, choices, default='Low')
    
    return data

def train_and_evaluate():
    # Load or generate data
    dataset_path = 'dataset.csv'
    if os.path.exists(dataset_path):
        df = pd.read_csv(dataset_path)
    else:
        print("Dataset not found, generating dummy data...")
        df = generate_dummy_data()
        df.to_csv('dummy_dataset.csv', index=False)

    X = df[FEATURES]
    y = df[TARGET]

    # Preprocessing
    # 1. Handle missing values
    imputer = SimpleImputer(strategy='median')
    X_imputed = imputer.fit_transform(X)

    # 2. Normalization
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_imputed)

    # 3. Encode categorical data (Target)
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    # Train Test Split
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y_encoded, test_size=0.2, random_state=42)

    # Train Random Forest Model
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_model.fit(X_train, y_train)

    # Evaluate
    y_pred = rf_model.predict(X_test)
    
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
    recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
    f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)

    metrics = {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1_score': f1
    }

    print("Model Evaluation Metrics:")
    print(json.dumps(metrics, indent=4))

    # Save model and preprocessors
    joblib.dump(rf_model, 'rf_model.joblib')
    joblib.dump(scaler, 'scaler.joblib')
    joblib.dump(imputer, 'imputer.joblib')
    joblib.dump(label_encoder, 'label_encoder.joblib')
    
    with open('metrics.json', 'w') as f:
        json.dump(metrics, f)

if __name__ == "__main__":
    train_and_evaluate()
