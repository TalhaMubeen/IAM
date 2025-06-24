const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const logger = require('./logger.config');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
});
app.use(limiter);

// Request logging
app.use(morgan('combined', {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

module.exports = app; 