const { db } = require('../config/db.config');
const logger = require('../config/logger.config');

const groups = [
    {
        name: 'System Administrators',
        description: 'Group for system administrators with full access'
    },
    {
        name: 'Administrators',
        description: 'Group for administrators with management access'
    },
    {
        name: 'Regular Users',
        description: 'Group for regular users with basic access'
    }
];

const seedGroups = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            const stmt = db.prepare('INSERT OR IGNORE INTO groups (name, description) VALUES (?, ?)');
            groups.forEach(group => {
                stmt.run(group.name, group.description, (err) => {
                    if (err) {
                        logger.error(`Error seeding group ${group.name}:`, err);
                    } else {
                        logger.info(`Seeded group: ${group.name}`);
                    }
                });
            });

            stmt.finalize((err) => {
                if (err) {
                    logger.error('Error finalizing group seed:', err);
                    reject(err);
                } else {
                    logger.info('Group seeding completed');
                    resolve();
                }
            });
        });
    });
};

module.exports = seedGroups;