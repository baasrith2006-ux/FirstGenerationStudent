const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const User = require('../models/User');

// Get chat history
router.get('/', async (req, res) => {
    try {
        const user = await User.findOne();
        if (!user) return res.json([]);
        const messages = await Chat.find({ userId: user._id }).sort({ date: 1 });
        res.json(messages.map(m => ({
            role: m.role,
            text: m.text,
            ts: m.ts,
            followups: m.followups
        })));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Save chat message
router.post('/', async (req, res) => {
    try {
        const user = await User.findOne() || await new User().save();
        const chat = new Chat({
            ...req.body,
            userId: user._id
        });
        const newChat = await chat.save();
        res.status(201).json(newChat);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Clear history
router.delete('/', async (req, res) => {
    try {
        const user = await User.findOne();
        if (user) await Chat.deleteMany({ userId: user._id });
        res.json({ message: 'Chat history cleared' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
