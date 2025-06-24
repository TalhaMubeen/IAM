const { db } = require('../config/db.config');
const logger = require('../config/logger.config');

const seedGroupRoles = () => {
    logger.info('Starting group roles seeding...');
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // First, get the System Administrators group ID
            db.get('SELECT id FROM groups WHERE name = ?', ['System Administrators'], (err, group) => {
                if (err) {
                    logger.error('Error finding System Administrators group:', err);
                    return reject(err);
                }

                if (!group) {
                    logger.error('System Administrators group not found');
                    return reject(new Error('System Administrators group not found'));
                }

                logger.info('Found System Administrators group:', group);

                // Then, get the Super Admin role ID
                db.get('SELECT id FROM roles WHERE name = ?', ['Super Admin'], (err, role) => {
                    if (err) {
                        logger.error('Error finding Super Admin role:', err);
                        return reject(err);
                    }

                    if (!role) {
                        logger.error('Super Admin role not found');
                        return reject(new Error('Super Admin role not found'));
                    }

                    logger.info('Found Super Admin role:', role);

                    // Insert the group-role relationship
                    const stmt = db.prepare('INSERT OR IGNORE INTO group_roles (group_id, role_id) VALUES (?, ?)');
                    stmt.run(group.id, role.id, function(err) {
                        if (err) {
                            logger.error('Error creating group-role relationship:', err);
                            return reject(err);
                        }
                        logger.info('Group-role relationship created successfully');
                        stmt.finalize();
                        resolve();
                    });
                });
            });
        });
    });
};

module.exports = seedGroupRoles; 