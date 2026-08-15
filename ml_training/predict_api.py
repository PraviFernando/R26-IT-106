from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

# Load model and scaler
try:
    model = joblib.load('exercise_model.pkl')
    scaler = joblib.load('scaler.pkl')
    print("Successfully loaded model and scaler.")
except Exception as e:
    print(f"Error loading model artifacts: {e}")
    model = None
    scaler = None

# Category mapping
CATEGORY_MAP = {
    1: "Bedrest/Breathing",
    2: "Gentle Mobility",
    3: "Strength & Core",
    4: "Full Functional"
}

@app.route('/predict', methods=['POST'])
def predict():
    if model is None or scaler is None:
        return jsonify({
            'success': False,
            'error': 'Model or scaler not loaded on server.'
        }), 500

    try:
        data = request.json
        print("DEBUG: Received JSON data:", data)
        
        # Extract features in exact order
        features = [
            int(data.get('weeks_after_delivery', 6)),
            int(data.get('delivery_type', 0)),
            int(data.get('pelvic_pain', 0)),
            int(data.get('back_pain', 0)),
            int(data.get('abdominal_pain', 0)),
            int(data.get('bleeding', 0)),
            int(data.get('doctor_restrictions', 0)),
            int(data.get('muscle_weakness', 0)),
            int(data.get('fatigue_level', 0)),
            int(data.get('mobility_level', 2)),
            int(data.get('willingness', 1))
        ]
        print("DEBUG: Extracted features:", features)
        
        # Scale and predict
        features_scaled = scaler.transform([features])
        prediction = model.predict(features_scaled)[0] # Multi-output prediction: [risk_score, category]
        
        risk_score = int(prediction[0])
        exercise_category = int(prediction[1])
        
        return jsonify({
            'success': True,
            'risk_score': risk_score,
            'exercise_category': exercise_category,
            'category_description': CATEGORY_MAP.get(exercise_category, "Unknown")
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(port=5001, debug=True)