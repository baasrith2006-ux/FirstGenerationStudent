const mongoose = require('mongoose');

const syllabusSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    subject: { type: String, default: 'generic' },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Syllabus', syllabusSchema);
