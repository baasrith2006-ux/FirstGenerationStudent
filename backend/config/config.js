require('dotenv').config();

const config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    supabase: {
        url: process.env.SUPABASE_URL,
        key: process.env.SUPABASE_KEY
    },
    security: {
        rateLimitWindow: 15 * 60 * 1000, // 15 minutes
        rateLimitMax: 100 // limit each IP to 100 requests per windowMs
    }
};

module.exports = config;
