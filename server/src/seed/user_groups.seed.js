const { db } = require('../config/db.config');
const logger = require('../config/logger.config');

const seedUserGroups = () => {
    logger.info('Starting user groups seeding...');
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // First, get the admin user ID
            db.get('SELECT id FROM users WHERE email = ?', ['admin@admin.com'], (err, user) => {
                if (err) {
                    logger.error('Error finding admin user:', err);
                    return reject(err);
                }

                if (!user) {
                    logger.error('Admin user not found');
                    return reject(new Error('Admin user not found'));
                }

                logger.info('Found admin user:', user);

                // Then, get the System Administrators group ID
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

                    // Insert the user-group relationship
                    const stmt = db.prepare('INSERT OR IGNORE INTO user_groups (user_id, group_id) VALUES (?, ?)');
                    stmt.run(user.id, group.id, function(err) {
                        if (err) {
                            logger.error('Error creating user-group relationship:', err);
                            return reject(err);
                        }
                        logger.info('User-group relationship created successfully');
                        stmt.finalize();
                        resolve();
                    });
                });
            });
        });
    });
};

module.exports = seedUserGroups;
