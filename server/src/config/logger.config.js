const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename: process.env.LOG_FILE_PATH || path.join(__dirname, '../../logs/app.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

module.exports = logger;