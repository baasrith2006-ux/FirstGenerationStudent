const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    icon: { type: String, default: '📚' },
    mastery: { type: Number, default: 0 },
    hours: { type: Number, default: 0 },
    color: { type: String, default: '#6C63FF' }
});

module.exports = mongoose.model('Subject', subjectSchema);
