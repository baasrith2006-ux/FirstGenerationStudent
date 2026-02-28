const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/planner', require('./routes/plannerRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/syllabus', require('./routes/syllabusRoutes'));
app.use('/api/test-history', require('./routes/testHistoryRoutes'));

// Basic Route
app.get('/', (req, res) => {
    res.send('PathWise Backend (Supabase) is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Using Supabase as the database');
});
