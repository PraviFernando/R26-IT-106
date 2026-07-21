const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  fullName: { type: String, trim: true },
  age: { type: Number },
  phoneNumber: { type: String, trim: true },
  district: { type: String, trim: true },
  village: { type: String, trim: true },
  babyDetails: {
    birthday: { type: String, trim: true },
    weight: { type: String, trim: true },
    height: { type: String, trim: true },
    vaccinations: [{
      name: { type: String, trim: true },
      date: { type: String, trim: true }
    }]
  },
  growthHistory: [{
    date: { type: String, trim: true },
    weight: { type: String, trim: true },
    length: { type: String, trim: true },
    headCircumference: { type: String, trim: true },
    notes: { type: String, trim: true }
  }],

  // ── Onboarding ─────────────────────────────────────────────────────────────
  onboardingCompleted: { type: Boolean, default: false },

  // Step 1 – Delivery Information
  deliveryType: { type: String, trim: true },
  deliveryDate: { type: String, trim: true },
  numBabies:    { type: String, trim: true, default: 'Single' },

  // Step 2 – Baby Details
  babyName:          { type: String, trim: true },
  gender:            { type: String, trim: true },
  birthWeight:       { type: String, trim: true },
  currentWeight:     { type: String, trim: true },
  birthLength:       { type: String, trim: true },
  currentLength:     { type: String, trim: true },
  headCircumference: { type: String, trim: true },

  // Step 3 – Feeding
  feedingMethod: { type: String, trim: true },
  // ───────────────────────────────────────────────────────────────────────────

  role: {
    type: String,
    enum: ['admin', 'midwife', 'manager', 'doctor', 'patient'],
    default: 'patient',
  },
  profilePicture: {
    type: String,
    default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);