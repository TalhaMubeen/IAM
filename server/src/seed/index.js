const { db } = require('../config/db.config');
const { initializeDatabase } = require('../config/db.config');
const path = require('path');
const fs = require('fs');
const logger = require('../config/logger.config');
const verifySeeds = require('./verify.seed');

const runSeeds = async () => {
    try {
        // Initialize database schema first
        await initializeDatabase();
        // Read and execute init-data.sql
        const initDataPath = path.join(__dirname, 'init-data.sql');
        const initData = fs.readFileSync(initDataPath, 'utf8');
        // Execute init-data.sql
        await new Promise((resolve, reject) => {
            db.exec(initData, (err) => {
                if (err) {
                    logger.error('Error executing init-data.sql:', err);
                    reject(err);
                } else {
                    logger.info('init-data.sql executed successfully');
                    resolve();
                }
            });
        });

        // Verify the seeded data
        await verifySeeds();
        logger.info('Database seeding completed successfully');
    } catch (error) {
        logger.error('Error during seeding:', error);
        process.exit(1);
    }
};

module.exports = runSeeds;