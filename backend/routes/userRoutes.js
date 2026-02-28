const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get user profile
router.get('/', async (req, res) => {
    try {
        // For now, we'll just use a single default user
        let user = await User.findOne();
        if (!user) {
            user = new User();
            await user.save();
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update user profile
router.patch('/', async (req, res) => {
    try {
        let user = await User.findOne();
        if (!user) user = new User();

        Object.assign(user, req.body);
        user.updatedAt = Date.now();
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
