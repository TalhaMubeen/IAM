const { db } = require('../config/db.config');
const logger = require('../config/logger.config');

const actions = ['create', 'read', 'update', 'delete'];

const seedPermissions = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Get all modules
            db.all('SELECT id, name FROM modules', [], (err, modules) => {
                if (err) {
                    logger.error('Error fetching modules for permission seeding:', err);
                    reject(err);
                    return;
                }

                const stmt = db.prepare('INSERT OR IGNORE INTO permissions (module_id, action) VALUES (?, ?)');

                // Create CRUD permissions for each module
                modules.forEach(module => {
                    actions.forEach(action => {
                        stmt.run(module.id, action, (err) => {
                            if (err) {
                                logger.error(`Error seeding permission ${action} for module ${module.name}:`, err);
                            } else {
                                logger.info(`Seeded permission: ${module.name}.${action}`);
                            }
                        });
                    });
                });

                stmt.finalize((err) => {
                    if (err) {
                        logger.error('Error finalizing permission seed:', err);
                        reject(err);
                    } else {
                        logger.info('Permission seeding completed');
                        resolve();
                    }
                });
            });
        });
    });
};

module.exports = seedPermissions;
