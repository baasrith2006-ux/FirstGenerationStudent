const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

const MOCK_USER_ID = '00000000-0000-0000-0000-000000000000';

// Get planner sessions
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('planner_sessions')
            .select('*')
            .eq('user_id', MOCK_USER_ID);

        if (error) throw error;

        // Group by day for the frontend
        const sessions = {
            Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: []
        };
        data.forEach(s => {
            if (sessions[s.day]) sessions[s.day].push({ ...s, _id: s.id });
        });

        res.json(sessions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add session
router.post('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('planner_sessions')
            .insert([{ ...req.body, user_id: MOCK_USER_ID }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ ...data, _id: data.id });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Remove session
router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('planner_sessions')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', MOCK_USER_ID);

        if (error) throw error;
        res.json({ message: 'Session removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
