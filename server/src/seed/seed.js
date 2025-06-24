const fs = require('fs');
const path = require('path');
const { db } = require('../config/db.config');
const logger = require('../config/logger.config');

const seedDatabase = async () => {
    try {
        // Read and execute schema
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await db.exec(schema);
        logger.info('Schema created successfully');

        // Read and execute seed data
        const seedPath = path.join(__dirname, 'seed.sql');
        const seed = fs.readFileSync(seedPath, 'utf8');
        await db.exec(seed);
        logger.info('Seed data inserted successfully');

        logger.info('Database seeding completed successfully');
    } catch (error) {
        logger.error('Error seeding database:', error);
        throw error;
    }
};

module.exports = seedDatabase; 