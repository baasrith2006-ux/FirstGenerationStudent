const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

const MOCK_USER_ID = '00000000-0000-0000-0000-000000000000';

// Get tasks
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', MOCK_USER_ID)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data.map(item => ({ ...item, _id: item.id })));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add task
router.post('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .insert([{ ...req.body, user_id: MOCK_USER_ID }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ ...data, _id: data.id });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Toggle task
router.patch('/:id/toggle', async (req, res) => {
    try {
        // First get current state
        const { data: current, error: getError } = await supabase
            .from('tasks')
            .select('completed')
            .eq('id', req.params.id)
            .single();

        if (getError) throw getError;

        const { data, error } = await supabase
            .from('tasks')
            .update({ completed: !current.completed })
            .eq('id', req.params.id)
            .eq('user_id', MOCK_USER_ID)
            .select()
            .single();

        if (error) throw error;
        res.json({ ...data, _id: data.id });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Remove task
router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: 'Task removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
