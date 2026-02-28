const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const User = require('../models/User');

// Get all subjects
router.get('/', async (req, res) => {
    try {
        const user = await User.findOne(); // Default user
        if (!user) return res.json([]);
        const subjects = await Subject.find({ userId: user._id });
        res.json(subjects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a subject
router.post('/', async (req, res) => {
    try {
        let user = await User.findOne();
        if (!user) {
            user = new User();
            await user.save();
        }
        const subject = new Subject({
            ...req.body,
            userId: user._id
        });
        const newSubject = await subject.save();
        res.status(201).json(newSubject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a subject
router.delete('/:id', async (req, res) => {
    try {
        await Subject.findByIdAndDelete(req.params.id);
        res.json({ message: 'Subject deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
