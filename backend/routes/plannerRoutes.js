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

        // Group by day for the frontend and map schema to frontend props
        const sessions = {
            Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: []
        };
        const colors = ['#8A2BE2', '#4169E1', '#00CED1', '#32CD32', '#FF8C00', '#FF1493'];

        data.forEach((session, idx) => {
            if (sessions[session.day]) {
                sessions[session.day].push({
                    ...session,
                    _id: session.id, // For DELETE operations
                    s: session.subject,
                    c: colors[idx % colors.length]
                });
            }
        });

        res.json(sessions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add session for a specific day
router.post('/:day', async (req, res) => {
    try {
        // extract frontend data format { s: 'Subject (time)', c: 'color' } 
        // fallback to separate subject/time if sent differently
        const subjectValue = req.body.s || req.body.subject || 'Study Session';

        const payload = {
            user_id: MOCK_USER_ID,
            day: req.params.day,
            subject: subjectValue,
            time: req.body.time || '45m'
        };

        const { error } = await supabase
            .from('planner_sessions')
            .insert([payload]);

        if (error) throw error;

        // Frontend expects the updated sessions array for this day
        const { data: updatedData } = await supabase
            .from('planner_sessions')
            .select('*')
            .eq('user_id', MOCK_USER_ID)
            .eq('day', req.params.day);

        const colors = ['#8A2BE2', '#4169E1', '#00CED1', '#32CD32', '#FF8C00', '#FF1493'];
        const formattedSessions = (updatedData || []).map((s, idx) => ({
            ...s, _id: s.id, s: s.subject, c: colors[idx % colors.length]
        }));

        res.status(201).json({ sessions: formattedSessions });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Remove session by day and array index (for backward compatibility if id is not passed correctly)
// The frontend uses deletePlannerSession(day, index) and api.js calls DELETE /planner/:day/:index
router.delete('/:day/:index', async (req, res) => {
    try {
        // Fetch sessions for this day to find the true ID based on the array index
        const { data: daySessions, error: fetchErr } = await supabase
            .from('planner_sessions')
            .select('id')
            .eq('user_id', MOCK_USER_ID)
            .eq('day', req.params.day)
            .order('created_at', { ascending: true }); // Assume chronological order is how frontend lists them

        if (fetchErr) throw fetchErr;

        const idx = parseInt(req.params.index, 10);
        if (daySessions && daySessions[idx]) {
            const targetId = daySessions[idx].id;
            const { error: delErr } = await supabase
                .from('planner_sessions')
                .delete()
                .eq('id', targetId)
                .eq('user_id', MOCK_USER_ID);

            if (delErr) throw delErr;
        }

        res.json({ message: 'Session removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
