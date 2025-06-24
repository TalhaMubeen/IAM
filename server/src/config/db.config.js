const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const logger = require('./logger.config');

const dbPath = process.env.DB_PATH || ':memory:';
const db = new sqlite3.Database(dbPath);

// Initialize database with schema
const initializeDatabase = () => {
    return new Promise((resolve, reject) => {
        try {
            const schemaPath = path.join(__dirname, '../seed/schema.sql');
            const schema = fs.readFileSync(schemaPath, 'utf8');

            db.exec(schema, (err) => {
                if (err) {
                    logger.error('Error initializing database:', err);
                    reject(err);
                } else {
                    logger.info('Database initialized successfully');
                    resolve();
                }
            });
        } catch (error) {
            logger.error('Error reading schema file:', error);
            reject(error);
        }
    });
};

// Test database connection
const testConnection = () => {
    return new Promise((resolve, reject) => {
        db.get('SELECT 1', (err) => {
            if (err) {
                logger.error('Database connection test failed:', err);
                reject(err);
            } else {
                logger.info('Database connection test successful');
                resolve();
            }
        });
    });
};

module.exports = {
    db,
    initializeDatabase,
    testConnection
};