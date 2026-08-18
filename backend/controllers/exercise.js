const PostpartumHealthData = require('../models/PostpartumHealthData');
const ExerciseRecord = require('../models/ExerciseRecord');
const User = require('../models/User');
const Diary = require('../models/Diary');
const Feedback = require('../models/Feedback');
const ExerciseMovementSession = require('../models/ExerciseMovementSession');
const MLPredictionService = require('../services/mlPredictionService');
const axios = require('axios');

// YouTube Search Queries Mapping
const QUERY_MAP = {
    1: "postpartum bedrest breathing exercises",
    2: "postpartum gentle mobility exercises",
    3: "postpartum core strength exercises",
    4: "postpartum functional workout exercises"
};

// Fallback dynamic videos in case YouTube API is unavailable
const FALLBACK_VIDEOS = {
    1: [
        { name: "Deep Breathing for Postpartum Bedrest", videoUrl: "https://www.youtube.com/embed/ifXo8tJE-t4", duration: "10:15" },
        { name: "Diaphragmatic Breathing Techniques", videoUrl: "https://www.youtube.com/embed/gAkjx25o4iM", duration: "7:40" },
        { name: "4-7-8 Calming Breath Work", videoUrl: "https://www.youtube.com/embed/ozf5CxbIugU", duration: "5:05" },
        { name: "Slow Pelvic Floor Activation", videoUrl: "https://www.youtube.com/embed/q2y1B5n0Ato", duration: "8:50" },
        { name: "Gentle Bedridden Recovery Breath", videoUrl: "https://www.youtube.com/embed/NKl8ImI3OVE", duration: "11:20" },
        { name: "Postpartum Bedrest Stretches", videoUrl: "https://www.youtube.com/embed/m3PrP3fW3Mg", duration: "9:10" },
        { name: "Calm Mind Breathing Exercise", videoUrl: "https://www.youtube.com/embed/ozf5CxbIugU", duration: "6:30" },
        { name: "Deep Core Connection Breathing", videoUrl: "https://www.youtube.com/embed/ifXo8tJE-t4", duration: "12:00" },
        { name: "Relaxing Diaphragmatic Breath", videoUrl: "https://www.youtube.com/embed/gAkjx25o4iM", duration: "8:15" },
        { name: "Bedrest Spine Alignment Breath", videoUrl: "https://www.youtube.com/embed/q2y1B5n0Ato", duration: "10:00" }
    ],
    2: [
        { name: "Pelvic Tilt & Gentle Mobility", videoUrl: "https://www.youtube.com/embed/44fYnoSLL1c", duration: "12:15" },
        { name: "Postpartum Neck and Shoulder Stretch", videoUrl: "https://www.youtube.com/embed/X3-gKPNyrTA", duration: "8:35" },
        { name: "Cat Cow Mobility Work", videoUrl: "https://www.youtube.com/embed/kqnua4rHVVA", duration: "6:10" },
        { name: "Upper Back Tension Relief", videoUrl: "https://www.youtube.com/embed/FxX5G6u0xE0", duration: "10:00" },
        { name: "Gentle Side Stretching", videoUrl: "https://www.youtube.com/embed/9Q-lsnaXc14", duration: "9:25" },
        { name: "Postpartum Seated Hip Openers", videoUrl: "https://www.youtube.com/embed/X3-gKPNyrTA", duration: "11:45" },
        { name: "Gentle Spine Mobility Exercises", videoUrl: "https://www.youtube.com/embed/kqnua4rHVVA", duration: "7:50" },
        { name: "Neck Tension Release Workout", videoUrl: "https://www.youtube.com/embed/FxX5G6u0xE0", duration: "9:00" },
        { name: "Lower Body Gentle Stretching", videoUrl: "https://www.youtube.com/embed/9Q-lsnaXc14", duration: "13:10" },
        { name: "Full Body Postpartum Release Stretch", videoUrl: "https://www.youtube.com/embed/44fYnoSLL1c", duration: "14:20" }
    ],
    3: [
        { name: "Kegel Exercise for Core Strength", videoUrl: "https://www.youtube.com/embed/MJ7EfGu03-0", duration: "15:00" },
        { name: "Postpartum Core Rehabilitation", videoUrl: "https://www.youtube.com/embed/m3PrP3fW3Mg", duration: "12:45" },
        { name: "Heel Slides Core Activation", videoUrl: "https://www.youtube.com/embed/K3m9m4UfJ5E", duration: "8:10" },
        { name: "Pelvic Floor Strengthening", videoUrl: "https://www.youtube.com/embed/NKl8ImI3OVE", duration: "10:30" },
        { name: "Belly Vacuum Breath Core", videoUrl: "https://www.youtube.com/embed/gAkjx25o4iM", duration: "6:50" },
        { name: "Bridges and Core Activation", videoUrl: "https://www.youtube.com/embed/MJ7EfGu03-0", duration: "11:15" },
        { name: "Postpartum Transverse Abdominis Work", videoUrl: "https://www.youtube.com/embed/m3PrP3fW3Mg", duration: "14:00" },
        { name: "Glute Bridges and Pelvic Activation", videoUrl: "https://www.youtube.com/embed/K3m9m4UfJ5E", duration: "9:35" },
        { name: "Deep Core Recovery Exercises", videoUrl: "https://www.youtube.com/embed/NKl8ImI3OVE", duration: "12:50" },
        { name: "Pilates-Based Core Strengthener", videoUrl: "https://www.youtube.com/embed/MJ7EfGu03-0", duration: "13:20" }
    ],
    4: [
        { name: "Gentle Walking & Cardio Recovery", videoUrl: "https://www.youtube.com/embed/enYITYwvPAQ", duration: "20:00" },
        { name: "Marching in Place Functional Workout", videoUrl: "https://www.youtube.com/embed/QtWxk_v4g_w", duration: "15:30" },
        { name: "Modified Squats for Strength", videoUrl: "https://www.youtube.com/embed/44fYnoSLL1c", duration: "12:20" },
        { name: "Full Body Postpartum Functional Movement", videoUrl: "https://www.youtube.com/embed/enYITYwvPAQ", duration: "18:45" },
        { name: "Postpartum Shoulder and Arm Circles", videoUrl: "https://www.youtube.com/embed/FxX5G6u0xE0", duration: "8:15" },
        { name: "Low-Impact Cardio Postpartum Workout", videoUrl: "https://www.youtube.com/embed/QtWxk_v4g_w", duration: "22:15" },
        { name: "Functional Squats and Lunges", videoUrl: "https://www.youtube.com/embed/44fYnoSLL1c", duration: "14:30" },
        { name: "Full Body Cardio Recovery", videoUrl: "https://www.youtube.com/embed/enYITYwvPAQ", duration: "16:40" },
        { name: "Postpartum Arm Toning Exercises", videoUrl: "https://www.youtube.com/embed/FxX5G6u0xE0", duration: "10:10" },
        { name: "Stamina Builder Walking Workout", videoUrl: "https://www.youtube.com/embed/QtWxk_v4g_w", duration: "25:00" }
    ]
};

// Parse YouTube ISO 8601 duration format (e.g. PT15M33S -> "15:33")
const parseISO8601Duration = (durationStr) => {
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = durationStr.match(regex);
    if (!matches) return '10:00';
    const hours = matches[1] ? parseInt(matches[1]) : 0;
    const minutes = matches[2] ? parseInt(matches[2]) : 0;
    const seconds = matches[3] ? parseInt(matches[3]) : 0;

    let result = '';
    if (hours > 0) {
        result += `${hours}:`;
    }
    result += `${hours > 0 ? String(minutes).padStart(2, '0') : minutes}:`;
    result += String(seconds).padStart(2, '0');
    return result;
};

const parseDurationStr = (dStr) => {
    if (!dStr) return 600;
    const str = String(dStr);
    if (str.includes(':')) {
        const parts = str.split(':');
        if (parts.length === 2) return parseInt(parts[0]) * 60 + parseInt(parts[1]);
        if (parts.length === 3) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    }
    return parseInt(str) * 60 || 600;
};

// Clinical Safety evaluation function
const evaluateSafetyStatus = (weeks, deliveryType, bleeding, doctorRestrictions) => {
    let safetyStatus = 'safe';
    let safetyMessage = '';
    let safetyMessageSi = '';

    if (doctorRestrictions) {
        safetyStatus = 'blocked';
        safetyMessage = 'Doctor has restricted exercise. Please follow medical advice.';
        safetyMessageSi = 'වෛද්‍යවරයා ව්‍යායාම සීමා කර ඇත. කරුණාකර වෛද්‍ය උපදෙස් අනුගමනය කරන්න.';
    } else if (bleeding) {
        safetyStatus = 'blocked';
        safetyMessage = 'Exercise is not recommended due to bleeding complications. Please consult your doctor.';
        safetyMessageSi = 'රුධිර වහනය හේතුවෙන් ව්‍යායාම නිර්දේශ නොකෙරේ. කරුණාකර ඔබේ වෛද්‍යවරයා හමුවන්න.';
    } else if (deliveryType === 'c-section' && weeks < 6) {
        safetyStatus = 'blocked';
        safetyMessage = 'C-section requires at least 6 weeks of recovery before exercise. Please consult your doctor.';
        safetyMessageSi = 'සිසේරියන් සැත්කමකින් පසු ව්‍යායාම සඳහා අවම වශයෙන් සති 6ක් ගතවිය යුතුය. කරුණාකර ඔබේ වෛද්‍යවරයා හමුවන්න.';
    }

    return { safetyStatus, safetyMessage, safetyMessageSi };
};

// Bilingual Mood Detection Function (English/Sinhala)
const analyzeDiaryMood = (text, emoji, diarySentiment) => {
    const content = (text || '').toLowerCase();
    let mood = 'neutral';

    if (diarySentiment === 'Negative Mind') mood = 'sad';
    else if (diarySentiment === 'Positive Mind') mood = 'happy';

    const happyEmojis = ['😊', '😄', '🥰', '🌟', '🌈', '🤩'];
    const sadEmojis = ['😔', '😢', '😭', '💔', '🥀', '😟'];

    if (happyEmojis.includes(emoji)) mood = 'happy';
    else if (sadEmojis.includes(emoji)) mood = 'sad';

    const sadWords = ['sad', 'depressed', 'cry', 'lonely', 'දුක', 'කණගාටු', 'කඳුළු'];
    const happyWords = ['happy', 'joy', 'joyful', 'great', 'සතුටු', 'සතුට', 'ප්‍රීති'];

    const hasSad = sadWords.some(w => content.includes(w));
    const hasHappy = happyWords.some(w => content.includes(w));

    if (hasHappy) mood = 'happy';
    if (hasSad) mood = 'sad';

    return mood;
};

// Apply Diary Rules (adjusting categories dynamically based on mood)
const applyDiaryRules = (exerciseCategory, mood) => {
    let finalCategory = exerciseCategory;

    // If the mood is detected as highly negative/sad, step down the exercise intensity
    if (mood === 'sad') {
        finalCategory = Math.max(1, exerciseCategory - 1);
        console.log(`[Diary Rule] Stepped down intensity due to sad mood: ${exerciseCategory} -> ${finalCategory}`);
    }

    return finalCategory;
};

/**
 * POST /exercise/health-data - Save daily health data and get recommendations
 */
const submitHealthData = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const {
            date, weeksAfterDelivery, deliveryDate, deliveryType, pelvicPain, backPain, abdominalPain,
            bleedingComplications, doctorRestrictions, fatigueLevel, mobilityLevel,
            muscleWeakness, willingnessToExercise, mood, sentiment, stressKeywords
        } = req.body;

        let finalWeeks = weeksAfterDelivery;
        let finalDeliveryDate = deliveryDate;

        if (deliveryDate) {
            await User.findByIdAndUpdate(userId, { deliveryDate });
            finalDeliveryDate = deliveryDate;
        } else {
            const user = await User.findById(userId);
            if (user && user.deliveryDate) {
                finalDeliveryDate = user.deliveryDate;
            }
        }

        // Only calculate weeks from deliveryDate if weeksAfterDelivery was not explicitly provided by the user
        if (finalDeliveryDate && !weeksAfterDelivery) {
            const birthDate = new Date(finalDeliveryDate);
            const today = new Date();
            const diffTime = Math.abs(today - birthDate);
            finalWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
        }

        const healthData = {
            userId,
            date,
            deliveryDate: finalDeliveryDate,
            weeksAfterDelivery: finalWeeks || weeksAfterDelivery || 0,
            deliveryType: deliveryType || 'normal',
            pelvicPain: pelvicPain === true || pelvicPain === 'true',
            backPain: backPain === true || backPain === 'true',
            abdominalPain: abdominalPain === true || abdominalPain === 'true',
            bleedingComplications: bleedingComplications === true || bleedingComplications === 'true',
            doctorRestrictions: doctorRestrictions === true || doctorRestrictions === 'true',
            fatigueLevel: fatigueLevel || 'low',
            mobilityLevel: mobilityLevel || 'normal',
            muscleWeakness: muscleWeakness || false,
            willingnessToExercise: willingnessToExercise || 'medium',
            mood: mood || '😊',
            sentiment: sentiment || 'Neutral',
            stressKeywords: stressKeywords || []
        };

        // 1. Get ML risk prediction and exercise category
        let riskScore = 1;
        let exerciseCategory = 3;
        let mlPredictionData = null;

        try {
            mlPredictionData = await MLPredictionService.predictRisk(healthData);
            if (mlPredictionData.success) {
                riskScore = mlPredictionData.riskLevel;
                exerciseCategory = mlPredictionData.exerciseCategory;
            }
        } catch (err) {
            console.error('ML API prediction failed:', err.message);
            // Fallback automatically sets fallback parameters
            const fallback = MLPredictionService.fallbackPrediction(healthData);
            riskScore = fallback.riskLevel;
            exerciseCategory = fallback.exerciseCategory;
        }

        // 2. No safety overrides to match Excel predictions directly
        let isOverridden = false;

        // Apply diary rules based on mood
        const diaryEntry = await Diary.findOne({ userId, date });
        const detectedMood = analyzeDiaryMood(
            diaryEntry ? diaryEntry.content : '',
            diaryEntry ? diaryEntry.mood : null,
            diaryEntry ? diaryEntry.sentiment : null
        );
        exerciseCategory = applyDiaryRules(exerciseCategory, detectedMood);

        // Smart Feedback adaptation: check last exercise session
        const lastExercise = await ExerciseRecord.findOne({ userId }).sort({ createdAt: -1 });
        if (lastExercise && (lastExercise.pain === 'Yes' || lastExercise.difficulty === 'Hard' || (lastExercise.adherenceScore !== undefined && lastExercise.adherenceScore < 50))) {
            exerciseCategory = Math.max(1, exerciseCategory - 1);
            console.log(`[AI Adaptation] Adjusted next session intensity down to Category ${exerciseCategory} due to previous pain/difficulty/incomplete session.`);
        }

        // Clinical Safety Override for severe symptoms / limited mobility
        const symptomsCount = 
            (healthData.pelvicPain ? 1 : 0) +
            (healthData.backPain ? 1 : 0) +
            (healthData.abdominalPain ? 1 : 0) +
            (healthData.muscleWeakness ? 1 : 0);

        if (symptomsCount >= 3) {
            exerciseCategory = 1; // Cap at Category 1 (Bedrest/Breathing)
            isOverridden = true;
        } else if (healthData.mobilityLevel === 'very_limited' || healthData.fatigueLevel === 'high' || symptomsCount === 2) {
            exerciseCategory = Math.min(exerciseCategory, 2); // Cap at Category 2 (Gentle Mobility)
            isOverridden = true;
        }

        // Evaluate dynamic safety status using clinical safety evaluation function
        const safetyEval = evaluateSafetyStatus(
            healthData.weeksAfterDelivery,
            healthData.deliveryType,
            healthData.bleedingComplications,
            healthData.doctorRestrictions
        );
        healthData.safetyStatus = safetyEval.safetyStatus;
        healthData.safetyMessage = safetyEval.safetyMessage;
        healthData.safetyMessageSi = safetyEval.safetyMessageSi;

        // If category was adjusted due to symptoms, update safety status to 'limited'
        if (isOverridden && healthData.safetyStatus === 'safe') {
            healthData.safetyStatus = 'limited';
            healthData.safetyMessage = 'Exercise category adjusted to Gentle Mobility due to fatigue, pain, or mobility limitations.';
            healthData.safetyMessageSi = 'තෙහෙට්ටුව, වේදනාව හෝ චලන සීමාවන් හේතුවෙන් ව්‍යායාම මට්ටම මෘදු ව්‍යායාම දක්වා සකස් කර ඇත.';
        }

        // 3. YouTube API integration to fetch matching videos
        let recommendedExercises = [];
        const searchQuery = QUERY_MAP[exerciseCategory];
        const youtubeApiKey = process.env.YOUTUBE_API_KEY;

        if (youtubeApiKey) {
            try {
                const ytResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                    params: {
                        part: 'snippet',
                        maxResults: 25,
                        q: searchQuery,
                        type: 'video',
                        key: youtubeApiKey
                    }
                });

                if (ytResponse.data && ytResponse.data.items) {
                    const videoIds = ytResponse.data.items.map(item => item.id.videoId).join(',');

                    // Query /videos API to retrieve contentDetails (which includes duration)
                    const detailsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
                        params: {
                            part: 'contentDetails',
                            id: videoIds,
                            key: youtubeApiKey
                        }
                    });

                    // Map video ID to its parsed human-readable duration
                    const durationMap = {};
                    if (detailsResponse.data && detailsResponse.data.items) {
                        detailsResponse.data.items.forEach(item => {
                            durationMap[item.id] = parseISO8601Duration(item.contentDetails.duration);
                        });
                    }

                    const mappedVideos = ytResponse.data.items.map(item => ({
                        customName: item.snippet.title,
                        videoUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
                        type: 'youtube_video',
                        duration: durationMap[item.id.videoId] || '10:00',
                        channelTitle: item.snippet.channelTitle,
                        category: exerciseCategory
                    }));

                    // Filter out YouTube Shorts (videos <= 60 seconds) and limit to 10 recommendations
                    recommendedExercises = mappedVideos
                        .filter(video => parseDurationStr(video.duration) > 60)
                        .slice(0, 10);
                }
            } catch (ytErr) {
                console.error('YouTube Data API search failed, loading static list:', ytErr.message);
            }
        }

        // If API search yielded no videos, fetch our pre-compiled fallback videos
        if (recommendedExercises.length === 0) {
            recommendedExercises = FALLBACK_VIDEOS[exerciseCategory].map(vid => ({
                customName: vid.name,
                videoUrl: vid.videoUrl,
                type: 'youtube_fallback',
                duration: vid.duration || "10:00",
                channelTitle: "Pregnancy & Postpartum TV",
                category: exerciseCategory
            }));
        }

        // Sort and apply personalization adjustment based on movement score
        const recentMovementSessions = await ExerciseMovementSession.find({ userId, completed: true })
            .sort({ timestamp: -1 })
            .limit(3);

        let personalizationAdjustment = null;
        let personalizationMessage = '';
        let personalizationMessageSi = '';

        if (recentMovementSessions.length === 3 && recentMovementSessions.every(s => s.movementScore >= 90 && (s.averageAccuracy || 0) >= 90 && s.difficulty === 'Easy')) {
            personalizationAdjustment = 'longer';
            personalizationMessage = "Great form! Based on your high scores and ease in recent sessions, we've prioritized longer exercise videos for you today.";
            personalizationMessageSi = "විශිෂ්ට ශාරීරික හැඩය! මෑත සැසිවල ඉහළ ලකුණු සහ පහසුව මත පදනම්ව, අපි අද ඔබට දිගු ව්‍යායාම වීඩියෝ නිර්දේශ කර ඇත්තෙමු.";
        } else if (recentMovementSessions.length > 0) {
            const lastSession = recentMovementSessions[0];
            if (lastSession.movementScore < 70 || (lastSession.averageAccuracy || 0) < 70 || lastSession.pain === true || lastSession.difficulty === 'Hard') {
                personalizationAdjustment = 'easier';
                personalizationMessage = "We noticed some difficulty or pain in your last session. We've prioritized shorter/gentler exercise videos today to support your recovery.";
                personalizationMessageSi = "පසුගිය සැසියේ යම් අපහසුතාවක් හෝ වේදනාවක් අපි දුටුවෙමු. සුවය ලැබීමට සහාය වීම සඳහා අද කෙටි/මෘදු ව්‍යායාම වීඩියෝ නිර්දේශ කර ඇත.";
            }
        }


        if (personalizationAdjustment === 'longer') {
            recommendedExercises.sort((a, b) => parseDurationStr(b.duration) - parseDurationStr(a.duration));
            if (healthData.safetyStatus !== 'blocked') {
                healthData.safetyMessage = (healthData.safetyMessage ? healthData.safetyMessage + ' ' : '') + personalizationMessage;
                healthData.safetyMessageSi = (healthData.safetyMessageSi ? healthData.safetyMessageSi + ' ' : '') + personalizationMessageSi;
            }
        } else if (personalizationAdjustment === 'easier') {
            recommendedExercises.sort((a, b) => parseDurationStr(a.duration) - parseDurationStr(b.duration));
            if (healthData.safetyStatus !== 'blocked') {
                healthData.safetyMessage = (healthData.safetyMessage ? healthData.safetyMessage + ' ' : '') + personalizationMessage;
                healthData.safetyMessageSi = (healthData.safetyMessageSi ? healthData.safetyMessageSi + ' ' : '') + personalizationMessageSi;
            }
        }

        healthData.recommendedExercises = recommendedExercises;

        // Delete any existing health data record for today to ensure new recommendations are clean and not cached/merged
        await PostpartumHealthData.deleteOne({ userId, date });

        // Save health data record to MongoDB
        const savedData = new PostpartumHealthData(healthData);
        await savedData.save();

        res.json({
            success: true,
            safetyStatus: healthData.safetyStatus,
            safetyMessage: healthData.safetyMessage,
            safetyMessageSi: healthData.safetyMessageSi,
            riskScore: riskScore,
            exerciseCategory: exerciseCategory,
            isSafetyOverrideApplied: isOverridden,
            recommendedExercises: recommendedExercises,
            healthDataId: savedData._id,
            detectedMood
        });

    } catch (err) {
        console.error('Error in submitHealthData:', err);
        next(err);
    }
};

/**
 * GET /exercise/health-data/:date
 */
const getHealthData = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { date } = req.params;

        let data = await PostpartumHealthData.findOne({ userId, date });

        if (!data) {
            const latestData = await PostpartumHealthData.findOne({ userId }).sort({ createdAt: -1 });
            return res.json({
                exists: false,
                healthData: latestData ? latestData.toObject() : null
            });
        }

        res.json({
            exists: true,
            safetyStatus: data.safetyStatus,
            safetyMessage: data.safetyMessage,
            safetyMessageSi: data.safetyMessageSi,
            recommendedExercises: data.recommendedExercises,
            date: data.date,
            healthData: data.toObject()
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /exercise/recommendations/:date
 */
const getRecommendations = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { date } = req.params;

        let healthData = await PostpartumHealthData.findOne({ userId, date });
        if (!healthData) {
            return res.json({ recommendations: [], hasData: false });
        }

        // Pad recommendations pool up to 10 for backward compatibility with old 5-video records
        if (healthData.recommendedExercises && healthData.recommendedExercises.length < 10) {
            // Find category
            const sampleRec = healthData.recommendedExercises[0];
            const exerciseCategory = (sampleRec && sampleRec.category) ? sampleRec.category : 3;

            const currentUrls = new Set(healthData.recommendedExercises.map(r => r.videoUrl));
            const categoryFallbacks = FALLBACK_VIDEOS[exerciseCategory] || [];

            for (const vid of categoryFallbacks) {
                if (healthData.recommendedExercises.length >= 10) break;
                if (!currentUrls.has(vid.videoUrl)) {
                    healthData.recommendedExercises.push({
                        customName: vid.name,
                        videoUrl: vid.videoUrl,
                        type: 'youtube_fallback',
                        duration: vid.duration || "10:00",
                        channelTitle: "Pregnancy & Postpartum TV",
                        completed: false,
                        watchPercentage: 0
                    });
                    currentUrls.add(vid.videoUrl);
                }
            }
            healthData.markModified('recommendedExercises');
            await healthData.save();
        }

        res.json({
            recommendations: healthData.recommendedExercises,
            hasData: true,
            safetyStatus: healthData.safetyStatus,
            safetyMessage: healthData.safetyMessage,
            safetyMessageSi: healthData.safetyMessageSi
        });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /exercise/record - Save exercise completion record
 */
const saveExerciseRecord = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const {
            date, exerciseId, customActivityName, status, accuracy,
            durationCompleted, userFeedback, liked,
            actualDuration, recommendedDuration, videoDuration,
            pain, difficulty, feelingAfter
        } = req.body;

        // Adherence score calculation
        let calculatedAdherence = 0;
        if (recommendedDuration > 0) {
            calculatedAdherence = Math.round((actualDuration / recommendedDuration) * 100);
        } else if (durationCompleted > 0) {
            calculatedAdherence = 100;
        }

        // Get daily health inputs
        const healthData = await PostpartumHealthData.findOne({ userId, date });
        const fatigueHigh = healthData ? (healthData.fatigueLevel === 'high') : false;
        const negativeMood = healthData ? (healthData.mood === '😔' || healthData.sentiment === 'Negative Mind' || healthData.detectedMood === 'sad') : false;

        // Intelligent Feedback generation
        let intelligentFeedback = "";
        if (pain === "Yes") {
            intelligentFeedback = "You felt pain during exercise. Please rest. Tomorrow's exercises will be adjusted to lower intensity.";
        } else if (calculatedAdherence < 50 || fatigueHigh || negativeMood) {
            intelligentFeedback = "You may be experiencing fatigue. Tomorrow’s exercises will be adjusted to lower intensity.";
        } else {
            intelligentFeedback = "Excellent progress. You may continue with the current exercise plan.";
        }

        const record = await ExerciseRecord.findOneAndUpdate(
            { userId, date, customActivityName },
            {
                userId, date, exerciseId, customActivityName, status, accuracy,
                durationCompleted: actualDuration || durationCompleted,
                userFeedback, liked, updatedAt: Date.now(),
                actualDuration, recommendedDuration, videoDuration,
                pain, difficulty, feelingAfter,
                adherenceScore: calculatedAdherence,
                intelligentFeedback
            },
            { upsert: true, new: true }
        );

        res.json({ success: true, record });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /exercise/video/upload - Mock video analysis
 */
const uploadVideo = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { date, customActivityName, videoUri } = req.body;

        const mockAccuracy = 70 + Math.floor(Math.random() * 25);
        const mockFeedback = mockAccuracy > 80 ? 'Excellent form!' : 'Good try! Keep practicing.';

        const record = await ExerciseRecord.findOneAndUpdate(
            { userId, date, customActivityName },
            { videoUrl: videoUri, accuracy: mockAccuracy, feedback: mockFeedback },
            { upsert: true, new: true }
        );

        res.json({
            success: true,
            accuracy: mockAccuracy,
            feedback: mockFeedback
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /exercise/progress
 */
const getProgress = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { days = 30 } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Number(days));
        const startDateStr = startDate.toISOString().split('T')[0];

        const records = await ExerciseRecord.find({
            userId,
            date: { $gte: startDateStr }
        }).sort({ date: 1 });

        const movementSessions = await ExerciseMovementSession.find({
            userId,
            createdAt: { $gte: startDate }
        }).sort({ createdAt: 1 });

        const completedRecords = records.filter(r => r.status === 'completed');

        // Calculate streak
        let currentStreak = 0;
        let bestStreak = 0;
        let tempStreak = 0;
        const completedDates = new Set(completedRecords.map(r => r.date));

        const today = new Date();
        for (let i = 0; i <= Number(days); i++) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dStr = d.toISOString().split('T')[0];
            if (completedDates.has(dStr)) {
                tempStreak++;
                if (tempStreak > bestStreak) bestStreak = tempStreak;
            } else {
                if (i === 0 || i === 1) {
                    currentStreak = tempStreak;
                }
                tempStreak = 0;
            }
        }
        if (currentStreak === 0 && tempStreak > 0) {
            currentStreak = tempStreak;
        }

        // Missed sessions
        let missedSessions = 0;
        for (let i = 1; i <= 7; i++) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dStr = d.toISOString().split('T')[0];
            if (!completedDates.has(dStr)) {
                missedSessions++;
            }
        }

        // Weekly participation percentage
        const weeklyCompletedDays = new Set(completedRecords.filter(r => {
            const rDate = new Date(r.date);
            const diffTime = Math.abs(today - rDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 7;
        }).map(r => r.date)).size;
        const weeklyCompletionRate = Math.min(100, Math.round((weeklyCompletedDays / 7) * 100));

        // Average exercise duration
        const totalDuration = completedRecords.reduce((sum, r) => sum + (r.actualDuration || r.durationCompleted || 0), 0);
        const averageDuration = completedRecords.length > 0 ? Math.round(totalDuration / completedRecords.length) : 0;

        // Recovery Trend Analysis
        const threeWeeksAgo = new Date();
        threeWeeksAgo.setDate(today.getDate() - 21);
        const threeWeeksAgoStr = threeWeeksAgo.toISOString().split('T')[0];

        const healthRecords = await PostpartumHealthData.find({
            userId,
            date: { $gte: threeWeeksAgoStr }
        }).sort({ date: 1 });

        let recoveryTrend = "No data yet to detect recovery trend. Keep logging daily health inputs.";
        if (completedRecords.length > 0 && healthRecords.length >= 3) {
            const firstThird = healthRecords.slice(0, Math.ceil(healthRecords.length / 3));
            const lastThird = healthRecords.slice(-Math.ceil(healthRecords.length / 3));

            const fatigueScore = { 'low': 1, 'medium': 2, 'high': 3 };
            const mobilityScore = { 'very_limited': 1, 'limited': 2, 'normal': 3 };

            const firstFatigueAvg = firstThird.reduce((sum, r) => sum + fatigueScore[r.fatigueLevel], 0) / firstThird.length;
            const lastFatigueAvg = lastThird.reduce((sum, r) => sum + fatigueScore[r.fatigueLevel], 0) / lastThird.length;

            const firstMobilityAvg = firstThird.reduce((sum, r) => sum + mobilityScore[r.mobilityLevel], 0) / firstThird.length;
            const lastMobilityAvg = lastThird.reduce((sum, r) => sum + mobilityScore[r.mobilityLevel], 0) / lastThird.length;

            if (lastFatigueAvg < firstFatigueAvg && lastMobilityAvg > firstMobilityAvg) {
                recoveryTrend = "Fantastic recovery trend detected! Over the past few weeks, your fatigue has decreased and your mobility has improved.";
            } else if (lastFatigueAvg < firstFatigueAvg) {
                recoveryTrend = "Positive trend: Your fatigue level has been decreasing over the last 3 weeks.";
            } else if (lastMobilityAvg > firstMobilityAvg) {
                recoveryTrend = "Positive trend: Your mobility is improving over the last 3 weeks.";
            } else {
                recoveryTrend = "Stable recovery pattern. Rest and follow recommendations daily.";
            }
        }

        const progressData = completedRecords.map(r => {
            // Dynamic progress score based on accuracy (if video was analyzed), stopwatch time (adherence), and feedback
            let score = r.accuracy;
            
            if (!score) {
                // If no video accuracy, use the stopwatch adherence score
                score = r.adherenceScore || 0;
                // If adherence is still 0 but exercise is completed, default to 100
                if (score === 0) score = 100;
            }
            
            // Adjust based on feedback (pain, difficulty, feeling after)
            if (r.pain === 'Yes') {
                score = Math.max(20, score - 15); // pain penalty
            }
            if (r.difficulty === 'Hard') {
                score = Math.max(20, score - 10); // difficulty adjustment
            }
            if (r.feelingAfter === 'Good' || r.feelingAfter === 'Excellent') {
                score = Math.min(100, score + 5); // feeling after bonus
            }
            
            return {
                date: r.date,
                avgAccuracy: Math.min(100, Math.max(0, Math.round(score)))
            };
        });

        // Compute movement tracking statistics
        const completedMovementSessions = movementSessions.filter(s => s.completed);
        const averageMovementScore = completedMovementSessions.length > 0
            ? Math.round(completedMovementSessions.reduce((sum, s) => sum + s.movementScore, 0) / completedMovementSessions.length)
            : 0;
        const bestMovementScore = completedMovementSessions.length > 0
            ? Math.max(...completedMovementSessions.map(s => s.movementScore))
            : 0;
        const totalMovementRepetitions = movementSessions.reduce((sum, s) => sum + (s.repetitions || 0), 0);

        // Compute movement accuracy stats
        const averageMovementAccuracy = completedMovementSessions.length > 0
            ? Math.round(completedMovementSessions.reduce((sum, s) => sum + (s.averageAccuracy || 0), 0) / completedMovementSessions.length)
            : 0;
        const bestMovementAccuracy = completedMovementSessions.length > 0
            ? Math.max(...completedMovementSessions.map(s => s.averageAccuracy || 0))
            : 0;
        const totalCorrectRepetitions = movementSessions.reduce((sum, s) => sum + (s.correctRepetitions || 0), 0);

        // Group movement sessions by date to calculate average score per day for Weekly Movement Trend
        const movementProgressMap = {};
        completedMovementSessions.forEach(s => {
            const dateStr = s.timestamp ? s.timestamp.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            if (!movementProgressMap[dateStr]) {
                movementProgressMap[dateStr] = { sum: 0, count: 0 };
            }
            movementProgressMap[dateStr].sum += s.movementScore;
            movementProgressMap[dateStr].count += 1;
        });

        const movementTrendData = Object.keys(movementProgressMap).map(date => ({
            date,
            avgScore: Math.round(movementProgressMap[date].sum / movementProgressMap[date].count)
        })).sort((a, b) => a.date.localeCompare(b.date));

        // Group movement sessions by date to calculate average accuracy per day for Weekly Accuracy Trend
        const accuracyProgressMap = {};
        completedMovementSessions.forEach(s => {
            const dateStr = s.timestamp ? s.timestamp.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            if (!accuracyProgressMap[dateStr]) {
                accuracyProgressMap[dateStr] = { sum: 0, count: 0 };
            }
            accuracyProgressMap[dateStr].sum += (s.averageAccuracy || 0);
            accuracyProgressMap[dateStr].count += 1;
        });

        const weeklyAccuracyTrendData = Object.keys(accuracyProgressMap).map(date => ({
            date,
            avgAccuracy: Math.round(accuracyProgressMap[date].sum / accuracyProgressMap[date].count)
        })).sort((a, b) => a.date.localeCompare(b.date));

        res.json({
            progressData,
            totalExercises: completedRecords.length,
            averageAccuracy: completedRecords.length > 0 ?
                Math.round(completedRecords.reduce((sum, r) => sum + (r.accuracy || 0), 0) / completedRecords.length) : 0,
            currentStreak,
            bestStreak,
            missedSessions,
            weeklyCompletionRate,
            averageDuration,
            recoveryTrend,
            // Movement tracked stats
            averageMovementScore,
            bestMovementScore,
            totalMovementRepetitions,
            completedMovementSessionsCount: completedMovementSessions.length,
            movementTrendData,
            // Accuracy stats
            averageMovementAccuracy,
            bestMovementAccuracy,
            totalCorrectRepetitions,
            weeklyAccuracyTrendData
        });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /exercise/feedback - Submit emoji/rating feedback on videos
 */
const submitFeedback = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { exerciseCategory, rating } = req.body;

        if (!exerciseCategory || !rating) {
            return res.status(400).json({ success: false, message: 'exerciseCategory and rating are required.' });
        }

        const newFeedback = await Feedback.create({
            userId,
            exerciseCategory: Number(exerciseCategory),
            rating: Number(rating),
            timestamp: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            feedback: newFeedback
        });
    } catch (err) {
        next(err);
    }
};

const updateRecommendationProgress = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { date, videoUrl, customName, watchPercentage } = req.body;

        const healthData = await PostpartumHealthData.findOne({ userId, date });
        if (healthData) {
            healthData.recommendedExercises = healthData.recommendedExercises.map(rec => {
                const match = rec.videoUrl === videoUrl || rec.customName === customName;
                if (match) {
                    rec.watchPercentage = Number(watchPercentage || 0);
                    if (rec.watchPercentage >= 80) {
                        rec.completed = true;
                    }
                }
                return rec;
            });
            healthData.markModified('recommendedExercises');
            await healthData.save();
        }
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};

// Seed mock functions to prevent breaking router dependency
const seedExercises = async (req, res) => res.json({ success: true, message: 'Seeding mock skipped (using dynamic YouTube search API).' });
const debugGetExercises = async (req, res) => res.json({ success: true, all: [] });

/**
 * POST /exercise/movement-session - Save movement tracking session
 */
const saveMovementSession = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const {
            sessionId, exerciseId, exerciseName, movementScore,
            repetitions, activeDuration, pauseCount, completed,
            pain, difficulty, postWorkoutFeeling,
            averageAccuracy, correctRepetitions, incorrectRepetitions,
            averageRangeOfMotion, averageJointAccuracy
        } = req.body;

        const session = await ExerciseMovementSession.findOneAndUpdate(
            { sessionId },
            {
                sessionId,
                userId,
                exerciseId,
                exerciseName,
                movementScore,
                repetitions,
                activeDuration,
                pauseCount,
                completed,
                pain: pain === true || pain === 'true' || pain === 'Yes',
                difficulty,
                postWorkoutFeeling,
                averageAccuracy: averageAccuracy || 0,
                correctRepetitions: correctRepetitions || 0,
                incorrectRepetitions: incorrectRepetitions || 0,
                averageRangeOfMotion: averageRangeOfMotion || 0,
                averageJointAccuracy: averageJointAccuracy || 0,
                timestamp: new Date()
            },
            { upsert: true, new: true }
        );

        res.json({ success: true, session });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /exercise/movement-sessions - Get user movement sessions
 */
const getMovementSessions = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const sessions = await ExerciseMovementSession.find({ userId }).sort({ timestamp: -1 });
        res.json({ success: true, sessions });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    submitHealthData,
    getHealthData,
    getRecommendations,
    saveExerciseRecord,
    uploadVideo,
    getProgress,
    seedExercises,
    debugGetExercises,
    submitFeedback,
    updateRecommendationProgress,
    saveMovementSession,
    getMovementSessions
};