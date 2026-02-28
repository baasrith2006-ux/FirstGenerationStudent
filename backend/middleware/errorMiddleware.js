const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error({
        message: err.message,
        path: req.path,
        method: req.method,
        stack: err.stack
    });

    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({
        success: false,
        status,
        message,
        timestamp: new Date()
    });
};

module.exports = errorHandler;
