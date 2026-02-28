const express = require('express');
const router = express.Router();
const TestHistory = require('../models/TestHistory');
const User = require('../models/User');

// Get test history
router.get('/', async (req, res) => {
    try {
        const user = await User.findOne();
        if (!user) return res.json([]);
        const history = await TestHistory.find({ userId: user._id }).sort({ date: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Save test result
router.post('/', async (req, res) => {
    try {
        const user = await User.findOne() || await new User().save();
        const test = new TestHistory({
            ...req.body,
            userId: user._id
        });
        const saved = await test.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
