const { db } = require('../config/db.config');
const logger = require('../config/logger.config');

const seedRolePermissions = () => {
    logger.info('Starting role permissions seeding...');
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // First, get the Super Admin role ID
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

                // Get all permissions
                db.all('SELECT id FROM permissions', [], (err, permissions) => {
                    if (err) {
                        logger.error('Error finding permissions:', err);
                        return reject(err);
                    }

                    if (!permissions || permissions.length === 0) {
                        logger.error('No permissions found');
                        return reject(new Error('No permissions found'));
                    }

                    logger.info('Found permissions:', permissions);

                    // Insert role-permission relationships
                    const stmt = db.prepare('INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)');
                    let completed = 0;
                    const total = permissions.length;

                    permissions.forEach(permission => {
                        stmt.run(role.id, permission.id, function(err) {
                            if (err) {
                                logger.error('Error creating role-permission relationship:', err);
                                return reject(err);
                            }
                            completed++;
                            if (completed === total) {
                                logger.info('All role-permission relationships created successfully');
                                stmt.finalize();
                                resolve();
                            }
                        });
                    });
                });
            });
        });
    });
};

module.exports = seedRolePermissions; 