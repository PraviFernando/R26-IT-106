const PostpartumHealthData = require('../models/PostpartumHealthData');
const ExerciseRecord = require('../models/ExerciseRecord');
const User = require('../models/User');
const Diary = require('../models/Diary');
const Feedback = require('../models/Feedback');
const ExerciseMovementSession = require('../models/ExerciseMovementSession');
const ExerciseWatchHistory = require('../models/ExerciseWatchHistory');
const EPDSScreening = require('../models/EPDSScreening');
const MLPredictionService = require('../services/mlPredictionService');
const axios = require('axios');
const mongoose = require('mongoose');
const CFG = require('../config/exerciseConfig');
const { parseDurationStr, toMinutes, toLocalDateStr, isValidDateStr, toBool, decodeHtml } = require('../utils/exerciseUtils');
const { buildVideoQueries } = require('../utils/exerciseVideoQueries');

const FATIGUE_LEVELS = ['low', 'medium', 'high'];
const MOBILITY_LEVELS = ['very_limited', 'limited', 'normal'];
const WILLINGNESS_LEVELS = ['low', 'medium', 'high'];
const DELIVERY_TYPES = ['normal', 'c-section', 'c_section'];
const RECORD_STATUSES = ['pending', 'completed', 'skipped', 'restricted'];
const DIFFICULTIES = ['Easy', 'Moderate', 'Hard'];
const FEELINGS = ['Better', 'Same', 'Tired'];

// Returns an error message for the first invalid field, or null when the body is valid
const validateHealthData = (body) => {
    if (!isValidDateStr(body.date)) return 'date is required in YYYY-MM-DD format';
    const w = body.weeksAfterDelivery;
    if (w !== undefined && w !== null && w !== '' && (!Number.isFinite(Number(w)) || Number(w) < 0 || Number(w) > 104)) {
        return 'weeksAfterDelivery must be a number between 0 and 104';
    }
    if (body.deliveryType && !DELIVERY_TYPES.includes(body.deliveryType)) return 'deliveryType must be normal or c-section';
    if (body.fatigueLevel && !FATIGUE_LEVELS.includes(body.fatigueLevel)) return 'fatigueLevel must be low, medium or high';
    if (body.mobilityLevel && !MOBILITY_LEVELS.includes(body.mobilityLevel)) return 'mobilityLevel must be very_limited, limited or normal';
    if (body.willingnessToExercise && !WILLINGNESS_LEVELS.includes(body.willingnessToExercise)) return 'willingnessToExercise must be low, medium or high';
    return null;
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
    if (!matches) return CFG.DEFAULT_VIDEO_DURATION;
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

// Clinical Safety evaluation function
const evaluateSafetyStatus = (weeks, deliveryType, bleeding, doctorRestrictions) => {
    let safetyStatus = 'safe';
    let safetyCode = null;
    let safetyMessage = '';
    let safetyMessageSi = '';

    if (doctorRestrictions) {
        safetyStatus = 'blocked';
        safetyCode = 'doctor_restricted';
        safetyMessage = 'Doctor has restricted exercise. Please follow medical advice.';
        safetyMessageSi = 'වෛද්‍යවරයා ව්‍යායාම සීමා කර ඇත. කරුණාකර වෛද්‍ය උපදෙස් අනුගමනය කරන්න.';
    } else if (bleeding) {
        safetyStatus = 'limited';
        safetyCode = 'bleeding';
        safetyMessage = 'Only breathing exercises are recommended due to bleeding complications. Please consult your doctor.';
        safetyMessageSi = 'රුධිර වහනය හේතුවෙන් මෘදු ශ්වසන ව්‍යායාම පමණක් නිර්දේශ කෙරේ. කරුණාකර ඔබේ වෛද්‍යවරයා හමුවන්න.';
    } else if (deliveryType === 'c-section' && weeks < CFG.C_SECTION_RECOVERY_WEEKS) {
        safetyStatus = 'limited';
        safetyCode = 'c_section_early';
        safetyMessage = 'Only breathing, gentle mobility, and light walking exercises are recommended within the first 6 weeks of a C-section. Please consult your doctor.';
        safetyMessageSi = 'සිසේරියන් සැත්කමකින් පසු පළමු සති 6 තුළ ශ්වසන ව්‍යායාම, මෘදු චලන සහ සැහැල්ලු ඇවිදීමේ ව්‍යායාම පමණක් නිර්දේශ කෙරේ. කරුණාකර ඔබේ වෛද්‍යවරයා හමුවන්න.';
    }

    return { safetyStatus, safetyCode, safetyMessage, safetyMessageSi };
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
        const validationError = validateHealthData(req.body);
        if (validationError) {
            return res.status(400).json({ success: false, message: validationError });
        }
        const {
            date, weeksAfterDelivery, deliveryDate, deliveryType, pelvicPain, backPain, abdominalPain,
            bleedingComplications, doctorRestrictions, fatigueLevel, mobilityLevel,
            muscleWeakness, willingnessToExercise, mood, sentiment, stressKeywords
        } = req.body;

        let finalWeeks = weeksAfterDelivery;
        let finalDeliveryDate = deliveryDate;
        let finalDeliveryType = deliveryType;

        const user = await User.findById(userId);

        if (deliveryDate) {
            await User.findByIdAndUpdate(userId, { deliveryDate });
            finalDeliveryDate = deliveryDate;
        } else if (user && user.deliveryDate) {
            finalDeliveryDate = user.deliveryDate;
        }

        if (deliveryType) {
            await User.findByIdAndUpdate(userId, { deliveryType });
            finalDeliveryType = deliveryType;
        } else if (user && user.deliveryType) {
            finalDeliveryType = user.deliveryType;
        } else {
            finalDeliveryType = 'normal';
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
            weeksAfterDelivery: Number(finalWeeks || weeksAfterDelivery || 0),
            deliveryType: finalDeliveryType === 'c_section' ? 'c-section' : finalDeliveryType,
            pelvicPain: toBool(pelvicPain),
            backPain: toBool(backPain),
            abdominalPain: toBool(abdominalPain),
            bleedingComplications: toBool(bleedingComplications),
            doctorRestrictions: toBool(doctorRestrictions),
            fatigueLevel: fatigueLevel || 'low',
            mobilityLevel: mobilityLevel || 'normal',
            muscleWeakness: toBool(muscleWeakness),
            willingnessToExercise: willingnessToExercise || 'medium',
            mood: mood || '😊',
            sentiment: sentiment || 'Neutral',
            stressKeywords: stressKeywords || []
        };

        // 1. Get EPDS risk screening, inject it to healthData, and get ML prediction
        let riskScore = 1;
        let exerciseCategory = 3;
        let mlPredictionData = null;

        try {
            const latestEpds = await EPDSScreening.findOne({ userId }).sort({ createdAt: -1 });
            const epdsRisk = latestEpds ? latestEpds.riskLevel : 'low';
            healthData.epdsRiskLevel = epdsRisk;

            mlPredictionData = await MLPredictionService.predictRisk(healthData);
            if (mlPredictionData.success) {
                riskScore = mlPredictionData.riskLevel;
                exerciseCategory = mlPredictionData.exerciseCategory;
            }
        } catch (err) {
            console.error('Failed to get ML prediction with EPDS risk level:', err.message);
            // Fallback automatically sets parameters using healthData (which now includes epdsRiskLevel)
            const fallback = MLPredictionService.fallbackPrediction(healthData);
            riskScore = fallback.riskLevel;
            exerciseCategory = fallback.exerciseCategory;
            mlPredictionData = fallback;
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
        if (lastExercise && (lastExercise.pain === 'Yes' || lastExercise.difficulty === 'Hard' || (lastExercise.adherenceScore !== undefined && lastExercise.adherenceScore < CFG.LOW_ADHERENCE_PERCENT))) {
            exerciseCategory = Math.max(1, exerciseCategory - 1);
            console.log(`[AI Adaptation] Adjusted next session intensity down to Category ${exerciseCategory} due to previous pain/difficulty/incomplete session.`);
        }

        // Clinical Safety Override for severe symptoms / limited mobility
        const symptomsCount = 
            (healthData.pelvicPain ? 1 : 0) +
            (healthData.backPain ? 1 : 0) +
            (healthData.abdominalPain ? 1 : 0) +
            (healthData.muscleWeakness ? 1 : 0);

        if (healthData.bleedingComplications) {
            exerciseCategory = 1; // Cap at Category 1 (Bedrest/Breathing) due to bleeding
            isOverridden = true;
        } else if (healthData.deliveryType === 'c-section' && healthData.weeksAfterDelivery < CFG.C_SECTION_RECOVERY_WEEKS) {
            exerciseCategory = Math.min(exerciseCategory, 2); // Cap at Category 2 (Gentle Mobility) for C-section under 6 weeks
            isOverridden = true;
        } else if (symptomsCount >= CFG.SEVERE_SYMPTOM_COUNT) {
            exerciseCategory = 1; // Cap at Category 1 (Bedrest/Breathing)
            isOverridden = true;
        } else if (healthData.mobilityLevel === 'very_limited' || healthData.fatigueLevel === 'high' || symptomsCount === CFG.MODERATE_SYMPTOM_COUNT) {
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
        let safetyCode = safetyEval.safetyCode;
        healthData.safetyMessage = safetyEval.safetyMessage;
        healthData.safetyMessageSi = safetyEval.safetyMessageSi;

        // If category was adjusted due to symptoms, update safety status to 'limited'
        if (isOverridden && healthData.safetyStatus === 'safe') {
            healthData.safetyStatus = 'limited';
            safetyCode = 'symptoms_adjusted';
            healthData.safetyMessage = 'Exercise category adjusted to Gentle Mobility due to fatigue, pain, or mobility limitations.';
            healthData.safetyMessageSi = 'තෙහෙට්ටුව, වේදනාව හෝ චලන සීමාවන් හේතුවෙන් ව්‍යායාම මට්ටම මෘදු ව්‍යායාම දක්වා සකස් කර ඇත.';
        }

        // 3. YouTube API integration to fetch matching videos
        // A doctor's restriction blocks exercise entirely, so no videos are recommended or saved
        const isBlocked = healthData.safetyStatus === 'blocked';
        let recommendedExercises = [];
        const youtubeApiKey = process.env.YOUTUBE_API_KEY;
        // Searches depend on the category AND the form (C-section, pain areas, energy, mood), see utils/exerciseVideoQueries.js
        const videoQueries = buildVideoQueries(exerciseCategory, { ...healthData, detectedMood });

        if (youtubeApiKey && !isBlocked) {
            try {
                const searches = await Promise.all(videoQueries.map(({ q, focus }) =>
                    axios.get('https://www.googleapis.com/youtube/v3/search', {
                        params: {
                            part: 'snippet',
                            maxResults: focus ? CFG.FOCUS_YOUTUBE_RESULTS : CFG.MAX_YOUTUBE_RESULTS,
                            q,
                            type: 'video',
                            key: youtubeApiKey
                        }
                    }).then(r => ({ focus, items: (r.data && r.data.items) || [] }))
                      .catch(err => {
                          console.error(`YouTube search failed for "${q}":`, err.message);
                          return { focus, items: [] };
                      })
                ));

                const allIds = [...new Set(searches.flatMap(sr => sr.items.map(item => item.id.videoId)).filter(Boolean))];
                if (allIds.length > 0) {
                    // Query /videos API to retrieve contentDetails (which includes duration); max 50 ids per call
                    const detailsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
                        params: { part: 'contentDetails', id: allIds.slice(0, 50).join(','), key: youtubeApiKey }
                    });

                    // Map video ID to its parsed human-readable duration
                    const durationMap = {};
                    if (detailsResponse.data && detailsResponse.data.items) {
                        detailsResponse.data.items.forEach(item => {
                            durationMap[item.id] = parseISO8601Duration(item.contentDetails.duration);
                        });
                    }

                    const toVideo = (item, focus) => ({
                        customName: decodeHtml(item.snippet.title),
                        videoUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
                        type: 'youtube_video',
                        duration: durationMap[item.id.videoId] || CFG.DEFAULT_VIDEO_DURATION,
                        channelTitle: decodeHtml(item.snippet.channelTitle),
                        category: exerciseCategory,
                        focus: focus || undefined
                    });
                    // Exclude YouTube Shorts (videos <= 60 seconds)
                    const usable = (v) => parseDurationStr(v.duration) > CFG.MIN_VIDEO_SECONDS;

                    // Focus videos first (a few per focus search), then fill up with the category search
                    const seen = new Set();
                    const take = (video) => {
                        if (seen.has(video.videoUrl) || !usable(video)) return false;
                        seen.add(video.videoUrl);
                        recommendedExercises.push(video);
                        return true;
                    };
                    for (const sr of searches.filter(x => x.focus)) {
                        let added = 0;
                        for (const item of sr.items) {
                            if (added >= CFG.FOCUS_VIDEOS_PER_QUERY) break;
                            if (take(toVideo(item, sr.focus))) added++;
                        }
                    }
                    for (const item of (searches.find(x => !x.focus) || { items: [] }).items) {
                        if (recommendedExercises.length >= CFG.RECOMMENDATION_POOL_SIZE) break;
                        take(toVideo(item, null));
                    }
                    recommendedExercises = recommendedExercises.slice(0, CFG.RECOMMENDATION_POOL_SIZE);
                }
            } catch (ytErr) {
                console.error('YouTube Data API search failed, loading static list:', ytErr.message);
                recommendedExercises = [];
            }
        }

        // If API search yielded no videos, fetch our pre-compiled fallback videos
        if (recommendedExercises.length === 0 && !isBlocked) {
            recommendedExercises = (FALLBACK_VIDEOS[exerciseCategory] || []).map(vid => ({
                customName: vid.name,
                videoUrl: vid.videoUrl,
                type: 'youtube_fallback',
                duration: vid.duration || CFG.DEFAULT_VIDEO_DURATION,
                channelTitle: "Pregnancy & Postpartum TV",
                category: exerciseCategory
            }));
        }

        // Sort and apply personalization adjustment based on movement score
        const recentMovementSessions = await ExerciseMovementSession.find({ userId: String(userId), completed: true })
            .sort({ timestamp: -1 })
            .limit(CFG.PERSONALISE_SESSION_COUNT);

        let personalizationAdjustment = null;
        let personalizationMessage = '';
        let personalizationMessageSi = '';

        const high = CFG.HIGH_PERFORMANCE_SCORE;
        const low = CFG.LOW_PERFORMANCE_SCORE;
        if (recentMovementSessions.length === CFG.PERSONALISE_SESSION_COUNT && recentMovementSessions.every(s => s.movementScore >= high && (s.averageAccuracy || 0) >= high && s.difficulty === 'Easy')) {
            personalizationAdjustment = 'longer';
            personalizationMessage = "Great form! Based on your high scores and ease in recent sessions, we've prioritized longer exercise videos for you today.";
            personalizationMessageSi = "විශිෂ්ට ශාරීරික හැඩය! මෑත සැසිවල ඉහළ ලකුණු සහ පහසුව මත පදනම්ව, අපි අද ඔබට දිගු ව්‍යායාම වීඩියෝ නිර්දේශ කර ඇත්තෙමු.";
        } else if (recentMovementSessions.length > 0) {
            const lastSession = recentMovementSessions[0];
            if (lastSession.movementScore < low || (lastSession.averageAccuracy || 0) < low || lastSession.pain === true || lastSession.difficulty === 'Hard') {
                personalizationAdjustment = 'easier';
                personalizationMessage = "We noticed some difficulty or pain in your last session. We've prioritized shorter/gentler exercise videos today to support your recovery.";
                personalizationMessageSi = "පසුගිය සැසියේ යම් අපහසුතාවක් හෝ වේදනාවක් අපි දුටුවෙමු. සුවය ලැබීමට සහාය වීම සඳහා අද කෙටි/මෘදු ව්‍යායාම වීඩියෝ නිර්දේශ කර ඇත.";
            }
        }


        if (personalizationAdjustment === 'longer') {
            recommendedExercises.sort((a, b) => (!!b.focus - !!a.focus) || (parseDurationStr(b.duration) - parseDurationStr(a.duration)));
            if (healthData.safetyStatus !== 'blocked') {
                healthData.safetyMessage = (healthData.safetyMessage ? healthData.safetyMessage + ' ' : '') + personalizationMessage;
                healthData.safetyMessageSi = (healthData.safetyMessageSi ? healthData.safetyMessageSi + ' ' : '') + personalizationMessageSi;
            }
        } else if (personalizationAdjustment === 'easier') {
            recommendedExercises.sort((a, b) => (!!b.focus - !!a.focus) || (parseDurationStr(a.duration) - parseDurationStr(b.duration)));
            if (healthData.safetyStatus !== 'blocked') {
                healthData.safetyMessage = (healthData.safetyMessage ? healthData.safetyMessage + ' ' : '') + personalizationMessage;
                healthData.safetyMessageSi = (healthData.safetyMessageSi ? healthData.safetyMessageSi + ' ' : '') + personalizationMessageSi;
            }
        }

        healthData.recommendedExercises = recommendedExercises;
        healthData.predictionSource = mlPredictionData && mlPredictionData.source ? mlPredictionData.source : 'rule_fallback';

        // Delete any existing health data record for today to ensure new recommendations are clean and not cached/merged
        await PostpartumHealthData.deleteOne({ userId, date });

        // Save health data record to MongoDB
        const savedData = new PostpartumHealthData(healthData);
        await savedData.save();

        res.json({
            success: true,
            safetyStatus: healthData.safetyStatus,
            safetyCode,
            personalizationCode: personalizationAdjustment ? `personalised_${personalizationAdjustment}` : null,
            safetyMessage: healthData.safetyMessage,
            safetyMessageSi: healthData.safetyMessageSi,
            riskScore: riskScore,
            riskLabel: mlPredictionData && mlPredictionData.riskLabel,
            exerciseCategory: exerciseCategory,
            // 'ml_model' when the trained model answered, 'rule_fallback' when the ML API was unavailable
            predictionSource: healthData.predictionSource,
            predictionConfidence: mlPredictionData && mlPredictionData.confidence,
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
        // Never pad a blocked (doctor-restricted) user or an empty list; empty means "no exercises" on purpose
        if (healthData.safetyStatus !== 'blocked' && healthData.recommendedExercises &&
            healthData.recommendedExercises.length > 0 && healthData.recommendedExercises.length < CFG.RECOMMENDATION_POOL_SIZE) {
            // Find category
            const sampleRec = healthData.recommendedExercises[0];
            const exerciseCategory = (sampleRec && sampleRec.category) ? sampleRec.category : 3;

            const currentUrls = new Set(healthData.recommendedExercises.map(r => r.videoUrl));
            const categoryFallbacks = FALLBACK_VIDEOS[exerciseCategory] || [];

            for (const vid of categoryFallbacks) {
                if (healthData.recommendedExercises.length >= CFG.RECOMMENDATION_POOL_SIZE) break;
                if (!currentUrls.has(vid.videoUrl)) {
                    healthData.recommendedExercises.push({
                        customName: vid.name,
                        videoUrl: vid.videoUrl,
                        type: 'youtube_fallback',
                        duration: vid.duration || CFG.DEFAULT_VIDEO_DURATION,
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
            predictionSource: healthData.predictionSource || null,
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
            pain, difficulty, feelingAfter, adherenceScore, performanceMetrics
        } = req.body;

        if (!isValidDateStr(date)) return res.status(400).json({ success: false, message: 'date is required in YYYY-MM-DD format' });
        if (!customActivityName) return res.status(400).json({ success: false, message: 'customActivityName is required' });
        if (status && !RECORD_STATUSES.includes(status)) return res.status(400).json({ success: false, message: 'invalid status' });
        if (pain && !['Yes', 'No'].includes(pain)) return res.status(400).json({ success: false, message: 'pain must be Yes or No' });
        if (difficulty && !DIFFICULTIES.includes(difficulty)) return res.status(400).json({ success: false, message: 'difficulty must be Easy, Moderate or Hard' });
        if (feelingAfter && !FEELINGS.includes(feelingAfter)) return res.status(400).json({ success: false, message: 'feelingAfter must be Better, Same or Tired' });

        // Durations may arrive as minutes or "mm:ss"; store minutes as numbers
        const actualMins = toMinutes(actualDuration);
        const recommendedMins = toMinutes(recommendedDuration);
        const completedMins = toMinutes(durationCompleted);

        // Adherence score calculation (capped at 100%)
        let calculatedAdherence = 0;
        if (recommendedMins > 0 && actualMins !== undefined) {
            calculatedAdherence = Math.round((actualMins / recommendedMins) * 100);
        } else if (typeof adherenceScore === 'number') {
            calculatedAdherence = Math.round(adherenceScore);
        } else if (completedMins > 0) {
            calculatedAdherence = 100;
        }
        calculatedAdherence = Math.min(100, Math.max(0, calculatedAdherence));

        // One record per exercise per day: when a later save (e.g. movement tracking or video auto-complete)
        // has no stopwatch time, keep the stopwatch time/adherence already recorded, and never un-complete it
        const existing = await ExerciseRecord.findOne({ userId, date, customActivityName });
        const keepStopwatch = existing && existing.actualDuration !== undefined && existing.actualDuration !== null && actualMins === undefined;
        if (keepStopwatch) {
            calculatedAdherence = existing.adherenceScore ?? calculatedAdherence;
        }
        const finalStatus = existing && existing.status === 'completed' ? 'completed' : status;

        // Get daily health inputs
        const healthData = await PostpartumHealthData.findOne({ userId, date });
        const fatigueHigh = healthData ? (healthData.fatigueLevel === 'high') : false;
        const negativeMood = healthData ? (healthData.mood === '😔' || healthData.sentiment === 'Negative Mind' || healthData.detectedMood === 'sad') : false;

        // Intelligent Feedback generation
        // feedbackCode lets the app translate the message without matching the English sentence
        let intelligentFeedback = "";
        let feedbackCode = "";
        if (pain === "Yes") {
            feedbackCode = 'pain_rest';
            intelligentFeedback = "You felt pain during exercise. Please rest. Tomorrow's exercises will be adjusted to lower intensity.";
        } else if (calculatedAdherence < CFG.LOW_ADHERENCE_PERCENT || fatigueHigh || negativeMood) {
            feedbackCode = 'fatigue_lower';
            intelligentFeedback = "You may be experiencing fatigue. Tomorrow’s exercises will be adjusted to lower intensity.";
        } else {
            feedbackCode = 'excellent';
            intelligentFeedback = "Excellent progress. You may continue with the current exercise plan.";
        }

        const record = await ExerciseRecord.findOneAndUpdate(
            { userId, date, customActivityName },
            {
                userId, date, exerciseId, customActivityName, status: finalStatus, accuracy,
                durationCompleted: keepStopwatch ? existing.durationCompleted : (actualMins ?? completedMins),
                userFeedback, liked, updatedAt: Date.now(),
                ...(keepStopwatch ? {} : { actualDuration: actualMins, recommendedDuration: recommendedMins }),
                videoDuration: toMinutes(videoDuration),
                ...(performanceMetrics ? { performanceMetrics } : {}),
                pain, difficulty, feelingAfter,
                adherenceScore: calculatedAdherence,
                intelligentFeedback,
                feedbackCode
            },
            { upsert: true, returnDocument: 'after' }
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

        // DEMO ONLY: no real video analysis is performed. The accuracy below is simulated and the
        // response is flagged with isDemo so the app can label it. Real form feedback comes from
        // live movement tracking (MovementTrackingScreen + /exercise/movement-session).
        const mockAccuracy = 70 + Math.floor(Math.random() * 25);
        const mockFeedback = mockAccuracy > 80 ? 'Excellent form!' : 'Good try! Keep practicing.';

        const record = await ExerciseRecord.findOneAndUpdate(
            { userId, date, customActivityName },
            { videoUrl: videoUri, accuracy: mockAccuracy, feedback: mockFeedback },
            { upsert: true, returnDocument: 'after' }
        );

        res.json({
            success: true,
            isDemo: true,
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
        const startDateStr = toLocalDateStr(startDate);

        const records = await ExerciseRecord.find({
            userId,
            date: { $gte: startDateStr }
        }).sort({ date: 1 });

        const movementSessions = await ExerciseMovementSession.find({
            userId: String(userId),
            createdAt: { $gte: startDate }
        }).sort({ createdAt: 1 });

        const completedRecords = records.filter(r => r.status === 'completed');

        // Calculate streaks over consecutive local calendar days
        const completedDates = new Set(completedRecords.map(r => r.date));
        const today = new Date();
        const dayStr = (offset) => {
            const d = new Date(today);
            d.setDate(today.getDate() - offset);
            return toLocalDateStr(d);
        };

        // Current streak counts back from today; if today is not done yet, yesterday keeps it alive
        let currentStreak = 0;
        let offset = completedDates.has(dayStr(0)) ? 0 : 1;
        while (offset <= Number(days) && completedDates.has(dayStr(offset))) {
            currentStreak++;
            offset++;
        }

        let bestStreak = 0;
        let tempStreak = 0;
        for (let i = Number(days); i >= 0; i--) {
            if (completedDates.has(dayStr(i))) {
                tempStreak++;
                bestStreak = Math.max(bestStreak, tempStreak);
            } else {
                tempStreak = 0;
            }
        }

        // Missed sessions in the last 7 days (excluding today)
        let missedSessions = 0;
        for (let i = 1; i <= 7; i++) {
            if (!completedDates.has(dayStr(i))) missedSessions++;
        }

        // Weekly participation percentage
        const weekStartStr = dayStr(6);
        const weeklyCompletedDays = new Set(completedRecords.filter(r => r.date >= weekStartStr).map(r => r.date)).size;
        const weeklyCompletionRate = Math.min(100, Math.round((weeklyCompletedDays / 7) * 100));

        // Average exercise duration
        const totalDuration = completedRecords.reduce((sum, r) => sum + (r.actualDuration || r.durationCompleted || 0), 0);
        const averageDuration = completedRecords.length > 0 ? Math.round(totalDuration / completedRecords.length) : 0;

        // Recovery Trend Analysis
        const threeWeeksAgo = new Date();
        threeWeeksAgo.setDate(threeWeeksAgo.getDate() - CFG.RECOVERY_TREND_DAYS);
        const threeWeeksAgoStr = toLocalDateStr(threeWeeksAgo);

        const healthRecords = await PostpartumHealthData.find({
            userId,
            date: { $gte: threeWeeksAgoStr }
        }).sort({ date: 1 });

        let recoveryTrend = "No data yet to detect recovery trend. Keep logging daily health inputs.";
        let recoveryTrendCode = 'no_data';
        if (completedRecords.length > 0 && healthRecords.length >= CFG.MIN_HEALTH_RECORDS_FOR_TREND) {
            const firstThird = healthRecords.slice(0, Math.ceil(healthRecords.length / 3));
            const lastThird = healthRecords.slice(-Math.ceil(healthRecords.length / 3));

            const fatigueScore = { 'low': 1, 'medium': 2, 'high': 3 };
            const mobilityScore = { 'very_limited': 1, 'limited': 2, 'normal': 3 };

            const avg = (rows, map, key, fallback) => rows.reduce((sum, r) => sum + (map[r[key]] ?? fallback), 0) / rows.length;
            const firstFatigueAvg = avg(firstThird, fatigueScore, 'fatigueLevel', 1);
            const lastFatigueAvg = avg(lastThird, fatigueScore, 'fatigueLevel', 1);
            const firstMobilityAvg = avg(firstThird, mobilityScore, 'mobilityLevel', 3);
            const lastMobilityAvg = avg(lastThird, mobilityScore, 'mobilityLevel', 3);

            if (lastFatigueAvg < firstFatigueAvg && lastMobilityAvg > firstMobilityAvg) {
                recoveryTrendCode = 'fatigue_down_mobility_up';
                recoveryTrend = "Fantastic recovery trend detected! Over the past few weeks, your fatigue has decreased and your mobility has improved.";
            } else if (lastFatigueAvg < firstFatigueAvg) {
                recoveryTrendCode = 'fatigue_down';
                recoveryTrend = "Positive trend: Your fatigue level has been decreasing over the last 3 weeks.";
            } else if (lastMobilityAvg > firstMobilityAvg) {
                recoveryTrendCode = 'mobility_up';
                recoveryTrend = "Positive trend: Your mobility is improving over the last 3 weeks.";
            } else {
                recoveryTrendCode = 'stable';
                recoveryTrend = "Stable recovery pattern. Rest and follow recommendations daily.";
            }
        }

        const recordScores = completedRecords.map(r => {
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
                score = Math.max(CFG.PROGRESS_MIN_SCORE, score - CFG.PROGRESS_PAIN_PENALTY); // pain penalty
            }
            if (r.difficulty === 'Hard') {
                score = Math.max(CFG.PROGRESS_MIN_SCORE, score - CFG.PROGRESS_HARD_PENALTY); // difficulty adjustment
            }
            if (r.feelingAfter === 'Better') {
                score = Math.min(100, score + CFG.PROGRESS_FEELING_BONUS); // feeling after bonus
            }
            
            return {
                date: r.date,
                avgAccuracy: Math.min(100, Math.max(0, Math.round(score)))
            };
        });

        // One point per day (average of that day's sessions) so charts are by day, not by workout
        const scoresByDay = {};
        recordScores.forEach(({ date, avgAccuracy }) => {
            if (!scoresByDay[date]) scoresByDay[date] = { sum: 0, count: 0 };
            scoresByDay[date].sum += avgAccuracy;
            scoresByDay[date].count += 1;
        });
        const progressData = Object.keys(scoresByDay).sort().map(date => ({
            date,
            avgAccuracy: Math.round(scoresByDay[date].sum / scoresByDay[date].count)
        }));

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
            const dateStr = toLocalDateStr(s.timestamp || new Date());
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
            const dateStr = toLocalDateStr(s.timestamp || new Date());
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
            recoveryTrendCode,
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
                const match = (videoUrl && rec.videoUrl === videoUrl) || (customName && rec.customName === customName);
                if (match) {
                    rec.watchPercentage = Number(watchPercentage || 0);
                    if (rec.watchPercentage >= CFG.WATCH_COMPLETE_PERCENT) {
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

        if (!sessionId) {
            return res.status(400).json({ success: false, message: 'sessionId is required' });
        }
        if (!exerciseName) return res.status(400).json({ success: false, message: 'exerciseName is required' });
        const inRange = (v, min, max) => v === undefined || (Number.isFinite(Number(v)) && Number(v) >= min && Number(v) <= max);
        if (!inRange(movementScore, 0, 100) || !inRange(averageAccuracy, 0, 100)) {
            return res.status(400).json({ success: false, message: 'movementScore and averageAccuracy must be between 0 and 100' });
        }
        if (!inRange(repetitions, 0, 10000) || !inRange(activeDuration, 0, 86400)) {
            return res.status(400).json({ success: false, message: 'repetitions and activeDuration must be positive numbers' });
        }
        if (difficulty && !DIFFICULTIES.includes(difficulty)) return res.status(400).json({ success: false, message: 'difficulty must be Easy, Moderate or Hard' });
        if (postWorkoutFeeling && !FEELINGS.includes(postWorkoutFeeling)) return res.status(400).json({ success: false, message: 'postWorkoutFeeling must be Better, Same or Tired' });
        // Never let one user overwrite another user's session
        const owner = await ExerciseMovementSession.findOne({ sessionId }).select('userId');
        if (owner && owner.userId !== String(userId)) {
            return res.status(403).json({ success: false, message: 'Not allowed to modify this session' });
        }

        const session = await ExerciseMovementSession.findOneAndUpdate(
            { sessionId, userId: String(userId) },
            {
                sessionId,
                userId: String(userId),
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
            { upsert: true, returnDocument: 'after' }
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
        const limit = Math.min(500, Math.max(1, parseInt(req.query.limit) || 100));
        const sessions = await ExerciseMovementSession.find({ userId: String(userId) }).sort({ timestamp: -1 }).limit(limit);
        res.json({ success: true, sessions });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /exercise/watch-history - Add or update a watched video in the user's history
 */
const upsertWatchHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const {
            videoId, videoUrl, title, thumbnailUrl, channelTitle,
            category, duration, watchPercentage, newSession
        } = req.body;

        if (!videoUrl) {
            return res.status(400).json({ success: false, message: 'videoUrl is required' });
        }

        const key = videoId || videoUrl;
        const pct = Math.min(100, Math.max(0, Number(watchPercentage) || 0));
        // Duration may arrive as minutes (15) or "mm:ss" / "h:mm:ss" from YouTube; store whole minutes
        const durationMins = duration ? Math.max(1, Math.round(parseDurationStr(duration) / 60)) : undefined;
        const fields = { videoUrl, title, thumbnailUrl, channelTitle, category, lastPercentage: pct, watchedAt: new Date() };
        if (durationMins) fields.duration = durationMins;

        const filter = { userId, videoId: key };
        // Atomic: $max keeps the highest percentage reached; watchCount starts at 1 on insert
        const upsertOnce = () => ExerciseWatchHistory.findOneAndUpdate(
            filter,
            { $set: fields, $max: { watchPercentage: pct } },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true, includeResultMetadata: true }
        );

        let result;
        try {
            result = await upsertOnce();
        } catch (err) {
            // Two concurrent first saves can both try to insert; the loser retries as an update
            if (err.code !== 11000) throw err;
            result = await upsertOnce();
        }

        let entry = result.value;
        const inserted = !!(result.lastErrorObject && result.lastErrorObject.upserted);
        const update = {};
        if (!inserted && newSession) update.$inc = { watchCount: 1 };
        const isComplete = entry.watchPercentage >= CFG.WATCH_COMPLETE_PERCENT;
        if (entry.completed !== isComplete) update.$set = { completed: isComplete };
        if (Object.keys(update).length) {
            entry = await ExerciseWatchHistory.findOneAndUpdate(filter, update, { returnDocument: 'after' });
        }

        res.json({ success: true, entry });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /exercise/watch-history?page=1&limit=20&search= - Watch history, newest first
 */
const getWatchHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
        const search = String(req.query.search || '').trim();

        const filter = { userId };
        if (search) {
            const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.title = { $regex: escaped, $options: 'i' };
        }

        const [items, total] = await Promise.all([
            ExerciseWatchHistory.find(filter)
                .sort({ watchedAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            ExerciseWatchHistory.countDocuments(filter)
        ]);

        res.json({ success: true, items, total, page, hasMore: page * limit < total });
    } catch (err) {
        next(err);
    }
};

/**
 * DELETE /exercise/watch-history/:id - Remove one video from history
 */
const deleteWatchHistoryItem = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(404).json({ success: false, message: 'History item not found' });
        }
        const result = await ExerciseWatchHistory.deleteOne({ _id: req.params.id, userId: req.user.id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'History item not found' });
        }
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};

/**
 * DELETE /exercise/watch-history - Clear the user's whole watch history
 */
const clearWatchHistory = async (req, res, next) => {
    try {
        const result = await ExerciseWatchHistory.deleteMany({ userId: req.user.id });
        res.json({ success: true, deleted: result.deletedCount });
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
    getMovementSessions,
    upsertWatchHistory,
    getWatchHistory,
    deleteWatchHistoryItem,
    clearWatchHistory
};
