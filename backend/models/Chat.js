const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['user', 'bot'], required: true },
    text: { type: String, required: true },
    ts: { type: String, required: true },
    followups: [String],
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', chatSchema);
