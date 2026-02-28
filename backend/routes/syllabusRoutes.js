const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

const MOCK_USER_ID = '00000000-0000-0000-0000-000000000000';

// Get syllabus topics
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('syllabus_topics')
            .select('*')
            .eq('user_id', MOCK_USER_ID)
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.json(data.map(item => ({ ...item, _id: item.id })));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Save multiple topics
router.post('/bulk', async (req, res) => {
    try {
        const topics = req.body.map(t => ({ name: t.name, subject: t.subject, user_id: MOCK_USER_ID }));

        // Clear old first
        await supabase.from('syllabus_topics').delete().eq('user_id', MOCK_USER_ID);

        const { data, error } = await supabase
            .from('syllabus_topics')
            .insert(topics)
            .select();

        if (error) throw error;
        res.status(201).json(data.map(item => ({ ...item, _id: item.id })));
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Clear syllabus
router.delete('/', async (req, res) => {
    try {
        const { error } = await supabase
            .from('syllabus_topics')
            .delete()
            .eq('user_id', MOCK_USER_ID);

        if (error) throw error;
        res.json({ message: 'Syllabus cleared' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
