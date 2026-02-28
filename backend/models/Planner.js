const mongoose = require('mongoose');

const plannerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    day: { type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], required: true },
    sessions: [{
        s: { type: String, required: true },
        c: { type: String, default: '#6C63FF' }
    }]
});

module.exports = mongoose.model('Planner', plannerSchema);
