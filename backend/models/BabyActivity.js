const mongoose = require('mongoose');

const babyActivitySchema = new mongoose.Schema({
    activity_id: { type: String, required: true, unique: true },
    activity_name: { type: String, required: true },
    activity_name_sinhala: { type: String },
    category: { type: String, required: true }, // e.g. "tummy_time", "leg_movement", etc.
    category_sinhala: { type: String },
    short_description: { type: String },
    short_description_sinhala: { type: String },
    purpose: { type: String },
    purpose_sinhala: { type: String },
    age_stage: { type: String }, // e.g. "Newborn / Early Months"
    age_stage_sinhala: { type: String },
    duration: { type: String }, // e.g. "2-3 min"
    instructions_english: [{ type: String }],
    instructions_sinhala: [{ type: String }],
    safety_notes: { type: String },
    safety_notes_sinhala: { type: String },
    video_source: { type: String, default: 'YouTube' },
    video_url: { type: String },
    reviewed_status: { type: String, enum: ['pending', 'reviewed', 'approved', 'rejected'], default: 'approved' }
}, { timestamps: true });

module.exports = mongoose.model('BabyActivity', babyActivitySchema);
