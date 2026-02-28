const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// Mock User ID for development (In production, use auth header)
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000000';

// Get user profile
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', MOCK_USER_ID)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (!data) {
            // Create default user if not exists
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert([{ id: MOCK_USER_ID }])
                .select()
                .single();
            if (createError) throw createError;
            return res.json({ ...newUser, _id: newUser.id });
        }

        res.json({ ...data, _id: data.id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update profile
router.post('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .update({ ...req.body, updated_at: new Date() })
            .eq('id', MOCK_USER_ID)
            .select()
            .single();

        if (error) throw error;
        res.json({ ...data, _id: data.id });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
