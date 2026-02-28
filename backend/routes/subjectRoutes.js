const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

const MOCK_USER_ID = '00000000-0000-0000-0000-000000000000';

// Get all subjects
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('subjects')
            .select('*')
            .eq('user_id', MOCK_USER_ID)
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.json(data.map(item => ({ ...item, _id: item.id })));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add subject
router.post('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('subjects')
            .insert([{ ...req.body, user_id: MOCK_USER_ID }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ ...data, _id: data.id });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Remove subject
router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('subjects')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', MOCK_USER_ID);

        if (error) throw error;
        res.json({ message: 'Subject removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
