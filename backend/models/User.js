const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, default: 'Student Name' },
    initials: { type: String, default: 'SN' },
    stream: { type: String, default: 'Not set' },
    year: { type: String, default: 'Not set' },
    goal: { type: String, default: 'Not set' },
    streak: { type: Number, default: 0 },
    dnaTraits: [String],
    dnaProfile: {
        type: { type: String },
        description: { type: String }
    },
    usedQuestions: {
        math: [Number],
        physics: [Number],
        cs: [Number],
        chemistry: [Number]
    },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
