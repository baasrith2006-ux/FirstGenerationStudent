const errorHandler = (err, req, res, next) => {
    console.error('--- ERROR LOG ---');
    console.error(`Path: ${req.path}`);
    console.error(`Method: ${req.method}`);
    console.error(`Error: ${err.message}`);
    console.error(err.stack);
    console.error('-----------------');

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
