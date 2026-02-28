const express = require('express');
const router = express.Router();
const Syllabus = require('../models/Syllabus');
const User = require('../models/User');

// Get syllabus topics
router.get('/', async (req, res) => {
    try {
        const user = await User.findOne();
        if (!user) return res.json([]);
        const topics = await Syllabus.find({ userId: user._id });
        res.json(topics);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Save multiple topics
router.post('/bulk', async (req, res) => {
    try {
        const user = await User.findOne() || await new User().save();
        const topics = req.body.map(t => ({ ...t, userId: user._id }));
        await Syllabus.deleteMany({ userId: user._id }); // Clear old
        const saved = await Syllabus.insertMany(topics);
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Clear syllabus
router.delete('/', async (req, res) => {
    try {
        const user = await User.findOne();
        if (user) await Syllabus.deleteMany({ userId: user._id });
        res.json({ message: 'Syllabus cleared' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
