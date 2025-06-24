const { db } = require('../config/db.config');
const logger = require('../config/logger.config');

const modules = [
    {
        name: 'Users',
        description: 'User management module'
    },
    {
        name: 'Groups',
        description: 'Group management module'
    },
    {
        name: 'Roles',
        description: 'Role management module'
    },
    {
        name: 'Modules',
        description: 'Module management module'
    },
    {
        name: 'Permissions',
        description: 'Permission management module'
    }
];

const seedModules = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            const stmt = db.prepare('INSERT OR IGNORE INTO modules (name, description) VALUES (?, ?)');
            modules.forEach(module => {
                stmt.run(module.name, module.description, (err) => {
                    if (err) {
                        logger.error(`Error seeding module ${module.name}:`, err);
                    } else {
                        logger.info(`Seeded module: ${module.name}`);
                    }
                });
            });

            stmt.finalize((err) => {
                if (err) {
                    logger.error('Error finalizing module seed:', err);
                    reject(err);
                } else {
                    logger.info('Module seeding completed');
                    resolve();
                }
            });
        });
    });
};

module.exports = seedModules;