const express = require('express');
const router = express.Router();
const Planner = require('../models/Planner');
const User = require('../models/User');

// Get weekly planner
router.get('/', async (req, res) => {
    try {
        const user = await User.findOne();
        if (!user) return res.json({});
        const plannerItems = await Planner.find({ userId: user._id });

        // Structure it like the frontend's plannerSessions
        const sessions = { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] };
        plannerItems.forEach(item => {
            sessions[item.day] = item.sessions;
        });
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add/Update session for a day
router.post('/:day', async (req, res) => {
    try {
        const { day } = req.params;
        const user = await User.findOne() || await new User().save();

        let planner = await Planner.findOne({ userId: user._id, day });
        if (!planner) {
            planner = new Planner({ userId: user._id, day, sessions: [] });
        }

        planner.sessions.push(req.body);
        await planner.save();
        res.status(201).json(planner);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Remove session
router.delete('/:day/:index', async (req, res) => {
    try {
        const { day, index } = req.params;
        const user = await User.findOne();
        if (!user) return res.status(404).json({ message: 'User not found' });

        const planner = await Planner.findOne({ userId: user._id, day });
        if (planner) {
            planner.sessions.splice(index, 1);
            await planner.save();
        }
        res.json({ message: 'Session removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
