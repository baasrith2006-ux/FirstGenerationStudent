const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');
const logger = require('./utils/logger');

const app = express();
const PORT = config.port;

// Enterprise Security & Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
    windowMs: config.security.rateLimitWindow,
    max: config.security.rateLimitMax
});
app.use('/api/', limiter);

// Request Logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
});

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
    res.send('PathWise Enterprise Backend is running');
});

// Error Handling Middleware
app.use(require('./middleware/errorMiddleware'));

// Start Server
app.listen(PORT, () => {
    logger.info(`Server started on port ${PORT} in ${config.env} mode`);
});
