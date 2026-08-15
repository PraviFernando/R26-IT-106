const axios = require('axios');

const ML_API_URL = process.env.ML_API_URL || 'http://127.0.0.1:5001';

class MLPredictionService {
    
    /**
     * Map string inputs to numeric features expected by ML model
     */
    static preprocessFeatures(healthData) {
        const fatigueMap = { 'low': 0, 'medium': 1, 'high': 2 };
        const mobilityMap = { 'very_limited': 0, 'limited': 1, 'normal': 2 };
        const willingnessMap = { 'low': 0, 'medium': 1, 'high': 2 };
        
        return {
            weeks_after_delivery: Number(healthData.weeksAfterDelivery || 0),
            delivery_type: (healthData.deliveryType === 'c-section' || healthData.deliveryType === 'c_section') ? 1 : 0,
            pelvic_pain: healthData.pelvicPain ? 1 : 0,
            back_pain: healthData.backPain ? 1 : 0,
            abdominal_pain: healthData.abdominalPain ? 1 : 0,
            bleeding: healthData.bleedingComplications ? 1 : 0,
            doctor_restrictions: healthData.doctorRestrictions ? 1 : 0,
            muscle_weakness: healthData.muscleWeakness ? 1 : 0,
            fatigue_level: fatigueMap[healthData.fatigueLevel] ?? 0,
            mobility_level: mobilityMap[healthData.mobilityLevel] ?? 2,
            willingness: willingnessMap[healthData.willingnessToExercise] ?? 1
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
                    riskLevel: response.data.risk_score, // returns numeric score (0: High, 1: Low, 2: Medium)
                    exerciseCategory: response.data.exercise_category, // returns category (1-4)
                    categoryDescription: response.data.category_description
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
     * Fallback prediction when Flask server is offline.
     * Calculates risk score and category based on symptoms.
     */
    static fallbackPrediction(healthData) {
        let riskScore = 0; // Default to Low risk (0)
        let exerciseCategory = 3; // Default to Strength & Core (3)
        
        const symptomsCount = 
            (healthData.pelvicPain ? 1 : 0) +
            (healthData.backPain ? 1 : 0) +
            (healthData.abdominalPain ? 1 : 0) +
            (healthData.muscleWeakness ? 1 : 0);

        // High risk checks
        if (healthData.doctorRestrictions || 
            healthData.bleedingComplications || 
            (healthData.deliveryType === 'c-section' && healthData.weeksAfterDelivery < 6)) {
            riskScore = 2; // High risk (2)
            exerciseCategory = 1; // Bedrest (1)
        }
        // Medium risk checks
        else if (symptomsCount >= 2 || healthData.fatigueLevel === 'high' || healthData.mobilityLevel === 'limited') {
            riskScore = 1; // Medium risk (1)
            exerciseCategory = 2; // Gentle Mobility (2)
        }
        // Healthy / low risk
        else if (healthData.weeksAfterDelivery >= 8 && healthData.mobilityLevel === 'normal' && healthData.fatigueLevel === 'low') {
            riskScore = 0; // Low risk (0)
            exerciseCategory = 4; // Full Functional (4)
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
            exerciseCategory: exerciseCategory,
            categoryDescription: descriptions[exerciseCategory],
            isFallback: true
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