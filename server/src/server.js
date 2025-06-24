const app = require('./app');
const logger = require('./config/logger.config');
const { db } = require('./config/db.config');
const seedDatabase = require('./seed/seed');

// Load environment variables
require('dotenv').config();
const PORT = process.env.PORT || 3000;

// Initialize database and start server
const startServer = async () => {
    try {
        await seedDatabase();
        // Start server
        const server = app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                logger.warn(`Port ${PORT} is busy, trying ${PORT + 1}`);
                server.close();
                app.listen(PORT + 1, () => {
                    logger.info(`Server running on port ${PORT + 1}`);
                });
            } else {
                logger.error('Server error:', err);
            }
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            logger.info('SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                logger.info('Server closed');
                db.close((err) => {
                    if (err) {
                        logger.error('Error closing database:', err);
                        process.exit(1);
                    }
                    logger.info('Database connection closed');
                    process.exit(0);
                });
            });
        });

        process.on('SIGINT', () => {
            logger.info('SIGINT received. Shutting down gracefully...');
            server.close(() => {
                logger.info('Server closed');
                db.close((err) => {
                    if (err) {
                        logger.error('Error closing database:', err);
                        process.exit(1);
                    }
                    logger.info('Database connection closed');
                    process.exit(0);
                });
            });
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();

// Unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Promise Rejection:', err);
});

// Uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    setTimeout(() => {
        process.exit(1);
    }, 1000);
});
