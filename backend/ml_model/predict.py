import sys
import json
import joblib
import pandas as pd
import os

def predict():
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input provided"}))
            return
            
        data = json.loads(input_data)
        
        # Define features in the correct order
        features = [
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
        
        # Ensure all features are present
        row = []
        for feature in features:
            if feature not in data:
                print(json.dumps({"error": f"Missing feature: {feature}"}))
                return
            row.append(data[feature])
            
        df = pd.DataFrame([row], columns=features)
        
        # Load models
        model_dir = os.path.dirname(os.path.abspath(__file__))
        rf_model = joblib.load(os.path.join(model_dir, 'rf_model.joblib'))
        scaler = joblib.load(os.path.join(model_dir, 'scaler.joblib'))
        imputer = joblib.load(os.path.join(model_dir, 'imputer.joblib'))
        label_encoder = joblib.load(os.path.join(model_dir, 'label_encoder.joblib'))
        
        # Preprocess
        X_imputed = imputer.transform(df)
        X_scaled = scaler.transform(X_imputed)
        
        # Predict
        prediction = rf_model.predict(X_scaled)
        prediction_label = label_encoder.inverse_transform(prediction)[0]
        
        probabilities = rf_model.predict_proba(X_scaled)[0]
        
        result = {
            "prediction": prediction_label,
            "probabilities": probabilities.tolist()
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    predict()
