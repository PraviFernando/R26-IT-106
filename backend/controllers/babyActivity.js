const BabyActivity = require('../models/BabyActivity');
const axios = require('axios');

// Initial seed data
const SEED_ACTIVITIES = [
    {
        activity_id: "tummy_time_1",
        activity_name: "Supervised Tummy Time",
        activity_name_sinhala: "අධීක්ෂණය යටතේ Tummy Time",
        category: "tummy_time",
        category_sinhala: "Tummy Time",
        short_description: "Simple supervised floor time while your baby is awake.",
        short_description_sinhala: "ඔබේ බිළිඳා අවදිව සිටින විට බිම තබා සිදුකරන සරල ක්‍රියාකාරකමකි.",
        purpose: "Helps build neck and shoulder strength.",
        purpose_sinhala: "බෙල්ල සහ උරහිස් ශක්තිමත් කිරීමට උපකාරී වේ.",
        age_stage: "Newborn / Early Months",
        age_stage_sinhala: "අලුත උපන් / මුල් මාස",
        duration: "2-3 min",
        instructions_english: [
            "Place your baby belly-down on a clean, firm mat.",
            "Lie down in front of your baby to encourage eye contact.",
            "Keep tummy time short and happy."
        ],
        instructions_sinhala: [
            "පිරිසිදු, ස්ථාවර පැදුරක් මත ඔබේ බිළිඳා මුණින් අතට තබන්න.",
            "ඔබේ බිළිඳා ඉදිරියෙන් වැතිරී ඇස් මට්ටම පවත්වා ගන්න.",
            "මෙය කෙටි සහ ප්‍රීතිමත් වේලාවක් බවට පත්කරන්න."
        ],
        safety_notes: "Always supervise your baby during tummy time. Never leave them unattended. Stop if distressed.",
        safety_notes_sinhala: "Tummy time අතරතුර සැමවිටම ඔබේ බිළිඳා දෙස බලා සිටින්න්න. කිසිවිටෙකත් තනි නොකරන්න.",
        video_source: "YouTube",
        video_url: "https://www.youtube.com/embed/H89k-xVLD98",
        reviewed_status: "approved"
    },
    {
        activity_id: "tummy_time_2",
        activity_name: "Tummy Time on Chest",
        activity_name_sinhala: "මවගේ පපුව මත Tummy Time",
        category: "tummy_time",
        category_sinhala: "Tummy Time",
        short_description: "Tummy time performed on your chest while reclining.",
        short_description_sinhala: "මඳක් ඇලවී සිටින විට ඔබේ පපුව මත බිළිඳා තබා සිදුකරයි.",
        purpose: "Encourages head raising and parent-infant bonding.",
        purpose_sinhala: "හිස එසවීමට සහ මව්-බිළිඳු සබඳතාවයට උපකාරී වේ.",
        age_stage: "Newborn / Early Months",
        age_stage_sinhala: "අලුත උපන් / මුල් මාස",
        duration: "3-5 min",
        instructions_english: [
            "Recline comfortably on a sofa or bed with pillows.",
            "Lay your baby belly-down on your chest, chest-to-chest.",
            "Talk or sing gently while they try to raise their head to look at you."
        ],
        instructions_sinhala: [
            "සෝෆා හෝ ඇඳක් මත කොට්ට තබා මඳක් ඇලවී පහසුවෙන් හිඳින්න.",
            "ඔබේ බිළිඳා ඔබේ පපුව මත මුණින් අතට තබන්න.",
            "ඔබ දෙස බැලීමට හිස ඔසවන විට මෘදුව කතා කරන්න හෝ ගීතයක් ගයන්න."
        ],
        safety_notes: "Ensure baby's airway is clear. Do not fall asleep with the baby on your chest.",
        safety_notes_sinhala: "බිළිඳාගේ ශ්වසන මාර්ගය හොඳින් විවෘතව ඇති බව තහවුරු කරගන්න. බිළිඳා පපුව මත සිටින විට නින්දට නොයන්න.",
        video_source: "YouTube",
        video_url: "https://www.youtube.com/embed/vV95f1qZ2aM",
        reviewed_status: "approved"
    },
    {
        activity_id: "leg_play_1",
        activity_name: "Gentle Kicking Play",
        activity_name_sinhala: "මෘදු පාද සෙලවීම්",
        category: "leg_movement",
        category_sinhala: "පාද සහ ශරීර සෙලවීම්",
        short_description: "Encouraging natural kicking movements on a soft surface.",
        short_description_sinhala: "මෘදු මතුපිටක් මත ස්වභාවික පාද සෙලවීම් දිරිමත් කිරීම.",
        purpose: "Promotes leg strength and coordination.",
        purpose_sinhala: "පාද ශක්තිමත් කිරීම සහ සම්බන්ධීකරණය ප්‍රවර්ධනය කරයි.",
        age_stage: "Around 2-4 Months",
        age_stage_sinhala: "මාස 2-4 පමණ",
        duration: "2 min",
        instructions_english: [
            "Place baby on their back on a safe play mat.",
            "Gently talk or shake a rattle near their feet to encourage kicking.",
            "Allow them to explore moving their legs freely."
        ],
        instructions_sinhala: [
            "බිළිඳා උඩුබැලි අතට ආරක්ෂිත පැදුරක් මත තබන්න.",
            "කකුල් සෙලවීමට දිරිමත් කිරීමට පාද අසලින් ශබ්දයක් කරන්න.",
            "නිදහසේ පාද චලනය කිරීමට ඉඩ දෙන්න."
        ],
        safety_notes: "Do not pull or force leg movements. Let movements be natural.",
        safety_notes_sinhala: "බලහත්කාරයෙන් පාද අදින්න හෝ චලනය නොකරන්න. ස්වභාවික චලනයන්ට ඉඩ දෙන්න.",
        video_source: "YouTube",
        video_url: "https://www.youtube.com/embed/44fYnoSLL1c",
        reviewed_status: "approved"
    },
    {
        activity_id: "reach_grasp_1",
        activity_name: "Reaching for a Soft Toy",
        activity_name_sinhala: "මෘදු සෙල්ලම් බඩුවක් ඇල්ලීම",
        category: "reaching_grasping",
        category_sinhala: "අත දිගු කිරීම් සහ ඇල්ලීම්",
        short_description: "Encouraging baby to reach for soft, colorful toys.",
        short_description_sinhala: "මෘදු, වර්ණවත් සෙල්ලම් බඩු ඇල්ලීමට අත දිගු කිරීම දිරිමත් කිරීම.",
        purpose: "Develops hand-eye coordination and grasping skills.",
        purpose_sinhala: "අත්-ඇස් සම්බන්ධීකරණය සහ ඇඟිලිවල ශක්තිය වර්ධනය කරයි.",
        age_stage: "Around 4-6 Months",
        age_stage_sinhala: "මාස 4-6 පමණ",
        duration: "3 min",
        instructions_english: [
            "Hold a soft toy about 8-10 inches above your baby's chest.",
            "Wait for them to look at the toy and open their hands.",
            "Gently encourage them to reach out and grasp it."
        ],
        instructions_sinhala: [
            "ඔබේ බිළිඳාගේ පපුවට ඉහළින් අඟල් 8-10ක් පමණ දුරින් මෘදු සෙල්ලම් බඩුවක් අල්ලන්න.",
            "බිළිඳා එය දෙස බලා දෑත් විවෘත කරන තෙක් සිටින්න.",
            "එය ඇල්ලීමට අත් දිගු කිරීමට මෘදුව දිරිමත් කරන්න."
        ],
        safety_notes: "Use lightweight, clean, and safe soft toys without small choking parts.",
        safety_notes_sinhala: "කුඩා කොටස් නොමැති, සැහැල්ලු සහ පිරිසිදු මෘදු සෙල්ලම් බඩු පමණක් භාවිතා කරන්න.",
        video_source: "YouTube",
        video_url: "https://www.youtube.com/embed/MJ7EfGu03-0",
        reviewed_status: "approved"
    }
];

// Seed function called internally or on server startup
const seedBabyActivities = async () => {
    try {
        // Fix wrong YouTube URLs in existing DB documents
        await BabyActivity.updateOne({ activity_id: "tummy_time_1" }, { video_url: "https://www.youtube.com/embed/H89k-xVLD98" });
        await BabyActivity.updateOne({ activity_id: "tummy_time_2" }, { video_url: "https://www.youtube.com/embed/vV95f1qZ2aM" });

        const count = await BabyActivity.countDocuments();
        if (count === 0) {
            console.log('[Seeding] Seeding initial baby activities database...');
            await BabyActivity.insertMany(SEED_ACTIVITIES);
            console.log('[Seeding] Baby activities seeded successfully.');
        }
    } catch (err) {
        console.error('Error seeding baby activities:', err.message);
    }
};

// Immediately execute seed check
seedBabyActivities();

const BABY_QUERY_MAP = {
    'tummy_time': "supervised baby tummy time exercises",
    'leg_movement': "gentle baby leg movement kicking play",
    'reaching_grasping': "baby reaching grasping play activities",
    'rolling_positioning': "baby rolling over positioning exercises",
    'gentle_arm': "gentle baby arm movement play",
    'sensory_movement': "baby sensory movement play activities"
};

/**
 * Get baby activities with optional filters (category, search, age_stage)
 */
const getActivities = async (req, res, next) => {
    try {
        const { category, search, ageFilter } = req.query;
        let query = { reviewed_status: 'approved' }; // Only approved content is shown

        if (category) {
            query.category = category;
        }

        // Get baby's age from User's deliveryDate
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        const deliveryDate = user ? user.deliveryDate : null;

        let calculatedAgeFilter = null;
        if (deliveryDate) {
            try {
                const birthDate = new Date(deliveryDate);
                const today = new Date();
                if (!isNaN(birthDate.getTime())) {
                    const diffTime = today - birthDate;
                    if (diffTime >= 0) {
                        const diffDays = diffTime / (1000 * 60 * 60 * 24);
                        const diffMonths = diffDays / 30;
                        if (diffMonths >= 0 && diffMonths < 3) {
                            calculatedAgeFilter = '0–3 months';
                        } else if (diffMonths >= 3 && diffMonths < 6) {
                            calculatedAgeFilter = '3–6 months';
                        } else if (diffMonths >= 6 && diffMonths < 9) {
                            calculatedAgeFilter = '6–9 months';
                        } else if (diffMonths >= 9) {
                            calculatedAgeFilter = '9–12 months';
                        }
                    }
                }
            } catch (e) {
                console.log("Error calculating baby age on backend", e);
            }
        }

        const finalAgeFilter = calculatedAgeFilter || (ageFilter && ageFilter !== 'All' ? ageFilter : '0–3 months');

        const cleanAge = finalAgeFilter.replace('–', '-').replace(' ', '').trim().toLowerCase();
        if (cleanAge.includes('0-3')) {
            query.age_stage = { $in: ['Newborn / Early Months', 'Developmentally Ready'] };
        } else if (cleanAge.includes('3-6')) {
            query.age_stage = { $in: ['Newborn / Early Months', 'Around 2-4 Months', 'Around 4-6 Months', 'Developmentally Ready'] };
        } else if (cleanAge.includes('6-9')) {
            query.age_stage = { $in: ['Around 2-4 Months', 'Around 4-6 Months', 'Around 6-9 Months', 'Developmentally Ready'] };
        } else if (cleanAge.includes('9-12')) {
            query.age_stage = { $in: ['Around 6-9 Months', 'Developmentally Ready'] };
        } else {
            query.age_stage = { $in: ['Newborn / Early Months', 'Developmentally Ready'] };
        }

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { activity_name: searchRegex },
                { activity_name_sinhala: searchRegex },
                { short_description: searchRegex },
                { short_description_sinhala: searchRegex }
            ];
        }

        let activities = [];

        // Dynamic fetch from YouTube Search API
        const youtubeApiKey = process.env.YOUTUBE_API_KEY;
        if (category && youtubeApiKey) {
            try {
                const searchQuery = `${BABY_QUERY_MAP[category] || category} baby development`;
                const ytResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                    params: {
                        part: 'snippet',
                        maxResults: 12,
                        q: searchQuery,
                        type: 'video',
                        key: youtubeApiKey
                    }
                });

                if (ytResponse.data && ytResponse.data.items) {
                    activities = ytResponse.data.items.map((item) => ({
                        _id: `yt_${item.id.videoId}`,
                        activity_id: `yt_${item.id.videoId}`,
                        activity_name: item.snippet.title,
                        activity_name_sinhala: `${item.snippet.title}`,
                        category: category,
                        short_description: `Supervised educational baby development video by ${item.snippet.channelTitle}.`,
                        short_description_sinhala: `${item.snippet.channelTitle} විසින් ඉදිරිපත් කරන අධ්‍යාපනික වීඩියෝවකි.`,
                        purpose: "Encourages motor skills, early infant movement and developmental coordination.",
                        purpose_sinhala: "මෝටර් කුසලතා, මුල් ළදරු චලනය සහ සංවර්ධන සම්බන්ධීකරණය දිරිමත් කරයි.",
                        age_stage: finalAgeFilter !== 'All' ? finalAgeFilter : "Developmentally Ready",
                        age_stage_sinhala: finalAgeFilter !== 'All' ? finalAgeFilter : "සංවර්ධනයට සූදානම්",
                        duration: "5 min",
                        instructions_english: [
                            "Watch the video with your baby awake.",
                            "Follow the practitioner's guidance carefully.",
                            "Stop immediately if your baby shows discomfort."
                        ],
                        instructions_sinhala: [
                            "බිළිඳා අවදිව සිටින විට වීඩියෝව නරඹන්න.",
                            "වෛද්‍ය උපදෙස් හොඳින් අනුගමනය කරන්න.",
                            "කිසිවිටෙකත් බලහත්කාරයෙන් චලනයන් සිදු නොකරන්න."
                        ],
                        safety_notes: "Always supervise your baby during movement activities. Stop if distress is noticed.",
                        safety_notes_sinhala: "ක්‍රියාකාරකම් අතරතුර සැමවිටම ඔබේ බිළිඳා දෙස බලා සිටින්න්න.",
                        video_source: "YouTube",
                        video_url: `https://www.youtube.com/embed/${item.id.videoId}`,
                        reviewed_status: "approved"
                    }));
                }
            } catch (ytErr) {
                console.error('YouTube API call failed in babyActivity controller:', ytErr.message);
            }
        }

        res.json({ success: true, activities, babyAgeFilter: calculatedAgeFilter });
    } catch (err) {
        next(err);
    }
};

/**
 * Get single activity by ID
 */
const getActivityById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (id && id.startsWith('yt_')) {
            const videoId = id.replace('yt_', '');
            return res.json({
                success: true,
                activity: {
                    _id: id,
                    activity_id: id,
                    activity_name: "Supervised Development Video",
                    activity_name_sinhala: "අධීක්ෂණය කරන ලද සංවර්ධන ක්‍රියාකාරකම",
                    category: "tummy_time",
                    short_description: "Supervised educational baby development video.",
                    short_description_sinhala: "අධ්‍යාපනික ළදරු සංවර්ධන වීඩියෝවකි.",
                    purpose: "Encourages early movement and coordination.",
                    purpose_sinhala: "මුල් චලනය සහ සම්බන්ධීකරණය දිරිමත් කරයි.",
                    age_stage: "Developmentally Ready",
                    age_stage_sinhala: "සංවර්ධනයට සූදානම්",
                    duration: "5 min",
                    instructions_english: [
                        "Watch the video with your baby awake.",
                        "Follow the guidance carefully.",
                        "Stop immediately if your baby shows discomfort."
                    ],
                    instructions_sinhala: [
                        "බිළිඳා අවදිව සිටින විට වීඩියෝව නරඹන්න.",
                        "වෛද්‍ය උපදෙස් හොඳින් අනුගමනය කරන්න.",
                        "කිසිවිටෙකත් බලහත්කාරයෙන් චලනයන් සිදු නොකරන්න."
                    ],
                    safety_notes: "Always supervise your baby during movement activities. Stop if distress is noticed.",
                    safety_notes_sinhala: "ක්‍රියාකාරකම් අතරතුර සැමවිටම ඔබේ බිළිඳා දෙස බලා සිටින්න්න.",
                    video_source: "YouTube",
                    video_url: `https://www.youtube.com/embed/${videoId}`
                }
            });
        }

        const activity = await BabyActivity.findById(id);
        if (!activity) {
            return res.status(404).json({ success: false, message: 'Activity not found' });
        }
        res.json({ success: true, activity });
    } catch (err) {
        next(err);
    }
};

/**
 * Admin: Create a new activity
 */
const createActivity = async (req, res, next) => {
    try {
        const newActivity = await BabyActivity.create(req.body);
        res.status(201).json({ success: true, activity: newActivity });
    } catch (err) {
        next(err);
    }
};

/**
 * Admin: Update activity
 */
const updateActivity = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updated = await BabyActivity.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Activity not found' });
        }
        res.json({ success: true, activity: updated });
    } catch (err) {
        next(err);
    }
};

/**
 * Admin: Delete activity
 */
const deleteActivity = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await BabyActivity.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Activity not found' });
        }
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getActivities,
    getActivityById,
    createActivity,
    updateActivity,
    deleteActivity
};
