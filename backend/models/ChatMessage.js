const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: String, required: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    sources: [{ title: String, section: String }],
    riskLevelUsed: { type: String, enum: ['low', 'medium', 'high'] },
    category: { type: String },
    guardrailZone: { type: String },
    isCrisis: { type: Boolean, default: false },
    feedback: { type: String, enum: ['up', 'down', null], default: null },
  },
  { timestamps: true }
);

chatMessageSchema.index({ userId: 1, sessionId: 1, createdAt: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
