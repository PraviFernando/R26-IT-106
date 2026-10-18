"""
Exercise model prediction API (port 5001), called by backend/services/mlPredictionService.js.

Setup (once):  py -m venv .venv && .venv\\Scripts\\pip install -r requirements.txt
Train  (once): .venv\\Scripts\\python train_exercise_model.py
Run:           .venv\\Scripts\\python predict_api.py
"""
import os

import joblib
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
try:
    model = joblib.load(os.path.join(BASE_DIR, 'exercise_model.pkl'))
    scaler = joblib.load(os.path.join(BASE_DIR, 'scaler.pkl'))
    print('Successfully loaded model and scaler.')
except Exception as e:
    print(f'Error loading model artifacts (run train_exercise_model.py first): {e}')
    model = None
    scaler = None

CATEGORY_MAP = {1: 'Bedrest/Breathing', 2: 'Gentle Mobility', 3: 'Strength & Core', 4: 'Full Functional'}
RISK_MAP = {0: 'low', 1: 'medium', 2: 'high'}

# Feature name -> (default, min, max), in the exact order the model was trained on
FEATURES = [
    ('weeks_after_delivery', 6, 0, 104),
    ('delivery_type', 0, 0, 1),
    ('pelvic_pain', 0, 0, 1),
    ('back_pain', 0, 0, 1),
    ('abdominal_pain', 0, 0, 1),
    ('bleeding', 0, 0, 1),
    ('doctor_restrictions', 0, 0, 1),
    ('muscle_weakness', 0, 0, 1),
    ('fatigue_level', 0, 0, 2),
    ('mobility_level', 2, 0, 2),
    ('willingness', 1, 0, 2),
    ('epds_risk_level', 0, 0, 2),
]


@app.route('/predict', methods=['POST'])
def predict():
    if model is None or scaler is None:
        return jsonify({'success': False, 'error': 'Model or scaler not loaded on server.'}), 500

    data = request.get_json(silent=True) or {}
    features = []
    for name, default, lo, hi in FEATURES:
        try:
            value = int(data.get(name, default))
        except (TypeError, ValueError):
            return jsonify({'success': False, 'error': f'{name} must be a number'}), 400
        if not lo <= value <= hi:
            return jsonify({'success': False, 'error': f'{name} must be between {lo} and {hi}'}), 400
        features.append(value)

    try:
        features_scaled = scaler.transform([features])
        prediction = model.predict(features_scaled)[0]  # [risk_score, exercise_category]
        # predict_proba returns one array per output; take the probability of the chosen class
        probabilities = model.predict_proba(features_scaled)
        risk_score = int(prediction[0])
        exercise_category = int(prediction[1])
        risk_conf = float(max(probabilities[0][0]))
        category_conf = float(max(probabilities[1][0]))

        return jsonify({
            'success': True,
            'risk_score': risk_score,
            'risk_label': RISK_MAP.get(risk_score, 'unknown'),
            'exercise_category': exercise_category,
            'category_description': CATEGORY_MAP.get(exercise_category, 'Unknown'),
            'risk_confidence': round(risk_conf, 3),
            'category_confidence': round(category_conf, 3),
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok' if model is not None else 'model_not_loaded'})


if __name__ == '__main__':
    app.run(port=5001, debug=False)
