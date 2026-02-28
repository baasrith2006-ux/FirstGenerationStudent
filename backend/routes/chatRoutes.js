const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

const MOCK_USER_ID = '00000000-0000-0000-0000-000000000000';

// Get chat history
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('chats')
            .select('*')
            .eq('user_id', MOCK_USER_ID)
            .order('timestamp', { ascending: true });

        if (error) throw error;
        res.json(data.map(item => ({ ...item, role: item.sender, _id: item.id })));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Save chat message
router.post('/', async (req, res) => {
    try {
        const payload = {
            text: req.body.text,
            sender: req.body.role || req.body.sender || 'user',
            user_id: MOCK_USER_ID
        };

        const { data, error } = await supabase
            .from('chats')
            .insert([payload])
            .select()
            .single();

        if (error) throw error;

        const responseData = { ...data, role: data.sender, _id: data.id };
        res.status(201).json(responseData);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Clear chat history
router.delete('/', async (req, res) => {
    try {
        const { error } = await supabase
            .from('chats')
            .delete()
            .eq('user_id', MOCK_USER_ID);

        if (error) throw error;
        res.json({ message: 'Chat cleared' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
