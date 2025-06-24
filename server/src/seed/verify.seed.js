const { db } = require('../config/db.config');
const logger = require('../config/logger.config');

const verifySeeds = () => {
    console.log('Verifying seed data...');
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Check admin user
            db.get('SELECT * FROM users WHERE email = ?', ['admin@admin.com'], (err, user) => {
                if (err) {
                    logger.error('Error checking admin user:', err);
                    return reject(err);
                }
                logger.info('Admin user:', user);

                if (!user) {
                    logger.error('Admin user not found');
                    return reject(new Error('Admin user not found'));
                }

                // Check all modules exist
                db.all('SELECT * FROM modules', (err, modules) => {
                    if (err) {
                        logger.error('Error checking modules:', err);
                        return reject(err);
                    }
                    logger.info('Modules:', modules);

                    if (!modules || modules.length === 0) {
                        logger.error('No modules found');
                        return reject(new Error('No modules found'));
                    }

                    // Check all permissions exist
                    db.all('SELECT * FROM permissions', (err, permissions) => {
                        if (err) {
                            logger.error('Error checking permissions:', err);
                            return reject(err);
                        }
                        logger.info('Permissions:', permissions);

                        if (!permissions || permissions.length === 0) {
                            logger.error('No permissions found');
                            return reject(new Error('No permissions found'));
                        }

                        // Check user-group relationship
                        db.get(
                            `SELECT g.* FROM groups g
                            JOIN user_groups ug ON g.id = ug.group_id
                            WHERE ug.user_id = ?`,
                            [user.id],
                            (err, group) => {
                                if (err) {
                                    logger.error('Error checking user-group relationship:', err);
                                    return reject(err);
                                }
                                logger.info('User group:', group);

                                if (!group) {
                                    logger.error('User-group relationship not found');
                                    return reject(new Error('User-group relationship not found'));
                                }

                                // Check group-role relationship
                                db.get(
                                    `SELECT r.* FROM roles r
                                    JOIN group_roles gr ON r.id = gr.role_id
                                    WHERE gr.group_id = ?`,
                                    [group.id],
                                    (err, role) => {
                                        if (err) {
                                            logger.error('Error checking group-role relationship:', err);
                                            return reject(err);
                                        }
                                        logger.info('Group role:', role);

                                        if (!role) {
                                            logger.error('Group-role relationship not found');
                                            return reject(new Error('Group-role relationship not found'));
                                        }

                                        // Check role-permission relationships with detailed logging
                                        db.all(
                                            `SELECT m.name as module, p.action, p.id as permission_id, m.id as module_id
                                            FROM permissions p
                                            JOIN role_permissions rp ON p.id = rp.permission_id
                                            JOIN modules m ON p.module_id = m.id
                                            WHERE rp.role_id = ?`,
                                            [role.id],
                                            (err, rolePermissions) => {
                                                if (err) {
                                                    logger.error('Error checking role-permission relationships:', err);
                                                    return reject(err);
                                                }
                                                logger.info('Role permissions:', rolePermissions);

                                                if (!rolePermissions || rolePermissions.length === 0) {
                                                    logger.error('Role-permission relationships not found');
                                                    return reject(new Error('Role-permission relationships not found'));
                                                }

                                                // Log the actual SQL query that would be used in checkPermission middleware
                                                const testQuery = `
                                                    SELECT p.action FROM permissions p
                                                    JOIN role_permissions rp ON p.id = rp.permission_id
                                                    JOIN group_roles gr ON rp.role_id = gr.role_id
                                                    JOIN user_groups ug ON gr.group_id = ug.group_id
                                                    JOIN modules m ON p.module_id = m.id
                                                    WHERE ug.user_id = ? AND m.name = ? AND p.action = ?
                                                `;
                                                logger.info('Test permission check query:', testQuery);

                                                // Test the actual permission check for a few combinations
                                                const testCases = [
                                                    { module: 'permissions', action: 'read' },
                                                    { module: 'modules', action: 'read' }
                                                ];

                                                testCases.forEach(test => {
                                                    db.get(testQuery, [user.id, test.module, test.action], (err, result) => {
                                                        if (err) {
                                                            logger.error(`Error testing permission for ${test.module}.${test.action}:`, err);
                                                        } else {
                                                            logger.info(`Permission check result for ${test.module}.${test.action}:`, result);
                                                        }
                                                    });
                                                });

                                                // Verify all modules have all CRUD permissions
                                                const expectedPermissions = modules.flatMap(module => 
                                                    ['create', 'read', 'update', 'delete'].map(action => ({
                                                        module: module.name,
                                                        action
                                                    }))
                                                );

                                                const missingPermissions = expectedPermissions.filter(expected => 
                                                    !rolePermissions.some(actual => 
                                                        actual.module === expected.module && 
                                                        actual.action === expected.action
                                                    )
                                                );

                                                if (missingPermissions.length > 0) {
                                                    logger.error('Missing permissions:', missingPermissions);
                                                    return reject(new Error('Some permissions are missing'));
                                                }

                                                logger.info('All seed data verified successfully');
                                                resolve();
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    });
                });
            });
        });
    });
};

module.exports = verifySeeds;
