const axios = require('axios');

const ML_API_URL = process.env.ML_API_URL || 'http://127.0.0.1:5001';

class MLPredictionService {
    
    /**
     * Map the health form to the exact numeric features the model was trained on
     * (same encoding as ml_training/relabel_dataset.py and predict_api.py).
     */
    static preprocessFeatures(healthData) {
        const flag = (v) => (v === true || v === 'true' || v === 1) ? 1 : 0;
        const weeks = Math.round(Number(healthData.weeksAfterDelivery));
        const fatigueMap = { 'low': 0, 'medium': 1, 'high': 2 };
        const mobilityMap = { 'very_limited': 0, 'limited': 1, 'normal': 2 };
        const willingnessMap = { 'low': 0, 'medium': 1, 'high': 2 };
        const epdsMap = { 'low': 0, 'medium': 1, 'moderate': 1, 'high': 2 };
        
        return {
            weeks_after_delivery: Number.isFinite(weeks) ? Math.min(104, Math.max(0, weeks)) : 0,
            delivery_type: (healthData.deliveryType === 'c-section' || healthData.deliveryType === 'c_section') ? 1 : 0,
            pelvic_pain: flag(healthData.pelvicPain),
            back_pain: flag(healthData.backPain),
            abdominal_pain: flag(healthData.abdominalPain),
            bleeding: flag(healthData.bleedingComplications),
            doctor_restrictions: flag(healthData.doctorRestrictions),
            muscle_weakness: flag(healthData.muscleWeakness),
            fatigue_level: fatigueMap[healthData.fatigueLevel] ?? 0,
            mobility_level: mobilityMap[healthData.mobilityLevel] ?? 2,
            willingness: willingnessMap[healthData.willingnessToExercise] ?? 1,
            epds_risk_level: epdsMap[healthData.epdsRiskLevel] ?? 0
        };
    }

    /**
     * Predict risk level and exercise category for a postpartum mother
     * @param {Object} healthData - Postpartum health data
     * @returns {Promise<Object>} Prediction result
     */
    static async predictRisk(healthData) {
        try {
            const pyData = this.preprocessFeatures(healthData);
            
            const response = await axios.post(`${ML_API_URL}/predict`, pyData, {
                timeout: 5000
            });
            
            if (response.data.success) {
                return {
                    success: true,
                    riskLevel: response.data.risk_score, // numeric risk: 0 = Low, 1 = Medium, 2 = High
                    riskLabel: response.data.risk_label,
                    exerciseCategory: response.data.exercise_category, // category 1-4
                    categoryDescription: response.data.category_description,
                    confidence: response.data.category_confidence,
                    isFallback: false,
                    source: 'ml_model'
                };
            } else {
                throw new Error(response.data.error);
            }
        } catch (error) {
            console.error('ML Prediction API error, switching to fallback:', error.message);
            return this.fallbackPrediction(healthData);
        }
    }
    
    /**
     * Fallback prediction when the Flask ML API is offline.
     * Uses exactly the clinical labelling rules the model was trained on
     * (ml_training/relabel_dataset.py, documented in docs/exercise-clinical-rules.md),
     * so the fallback and the model give the same answer for the same inputs.
     */
    static fallbackPrediction(healthData) {
        const f = this.preprocessFeatures(healthData);
        const weeks = f.weeks_after_delivery;
        const symptoms = f.pelvic_pain + f.back_pain + f.abdominal_pain + f.muscle_weakness;
        const cSection = f.delivery_type === 1;

        // Risk: 0 Low, 1 Medium, 2 High
        let riskScore = 0;
        if (f.doctor_restrictions || f.bleeding || symptoms >= 3) riskScore = 2;
        else if (weeks <= 2 || symptoms === 2 || f.fatigue_level === 2 || f.mobility_level === 0 ||
            f.epds_risk_level === 2 || (cSection && weeks < 6)) riskScore = 1;

        let exerciseCategory;
        if (f.doctor_restrictions || f.bleeding || symptoms >= 3 || weeks <= 2) {
            exerciseCategory = 1; // hard stop: rest and breathing only
        } else {
            exerciseCategory = weeks <= 5 ? 2 : weeks <= 7 ? 3 : 4;
            if (cSection && weeks < 6) exerciseCategory = Math.min(exerciseCategory, 2);
            if (symptoms === 2 || f.fatigue_level === 2 || f.mobility_level === 0) exerciseCategory = Math.min(exerciseCategory, 2);
            // Milder factors lower the level by one each, at most two levels; floor 2
            const reductions = [symptoms === 1, f.fatigue_level === 1, f.mobility_level === 1, f.willingness === 0, f.epds_risk_level === 2]
                .filter(Boolean).length;
            exerciseCategory = Math.max(2, Math.min(4, exerciseCategory - Math.min(reductions, 2)));
        }

        const descriptions = {
            1: "Bedrest/Breathing",
            2: "Gentle Mobility",
            3: "Strength & Core",
            4: "Full Functional"
        };

        return {
            success: true,
            riskLevel: riskScore,
            riskLabel: ['low', 'medium', 'high'][riskScore],
            exerciseCategory,
            categoryDescription: descriptions[exerciseCategory],
            isFallback: true,
            source: 'rule_fallback'
        };
    }

    /**
     * Check if ML API is healthy
     */
    static async healthCheck() {
        try {
            const response = await axios.get(`${ML_API_URL}/health`, { timeout: 3000 });
            return response.data;
        } catch (error) {
            return { status: 'unavailable', error: error.message };
        }
    }
}

module.exports = MLPredictionService;