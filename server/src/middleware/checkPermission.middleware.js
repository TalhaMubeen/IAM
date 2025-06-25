const logger = require('../config/logger.config');
const { db } = require('../config/db.config');

// Custom error classes for better error handling
class PermissionError extends Error {
    constructor(message, code = 'PERMISSION_ERROR') {
        super(message);
        this.name = 'PermissionError';
        this.code = code;
    }
}

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
        this.code = 'VALIDATION_ERROR';
    }
}

// Simple validation
const validateInput = (module, action) => {
    const validModules = ['user', 'group', 'role', 'module', 'permission']; // From seed.sql
    const validActions = ['create', 'read', 'update', 'delete'];
    if (!validModules.includes(module)) {
        throw new Error(`Invalid module: ${module}`);
    }
    if (!validActions.includes(action)) {
        throw new Error(`Invalid action: ${action}`);
    }
};


// Permission checking middleware
module.exports.checkPermission = (module, action) => {
    return async (req, res, next) => {
        try {
            // Validate input
            validateInput(module, action);

            // Check authentication
            if (!req.user?.id) {
                logger.error('Authentication required', { user: req.user });
                return res.status(401).json({ error: 'Authentication required' });
            }

            // Verify module exists
            const moduleExists = await new Promise((resolve, reject) => {
                db.get('SELECT id FROM modules WHERE name = ?', [module], (err, row) => {
                    if (err) {
                        logger.error('Error checking module existence:', { error: err.message });
                        reject(err);
                    }
                    resolve(!!row);
                });
            });

            if (!moduleExists) {
                logger.warn('Module not found:', { module });
                return res.status(400).json({ error: `Module '${module}' does not exist` });
            }

            // Permission check query, including optional user_roles
            const query = `
                SELECT DISTINCT 1
                FROM permissions p
                JOIN role_permissions rp ON p.id = rp.permission_id
                JOIN roles r ON rp.role_id = r.id
                LEFT JOIN (
                    SELECT gr.group_id, gr.role_id
                    FROM group_roles gr
                    JOIN user_groups ug ON gr.group_id = ug.group_id
                    WHERE ug.user_id = ?
                    UNION
                    SELECT NULL AS group_id, ur.role_id
                    FROM user_roles ur
                    WHERE ur.user_id = ?
                ) role_assignments ON r.id = role_assignments.role_id
                JOIN modules m ON p.module_id = m.id
                WHERE m.name = ?
                AND p.action = ?
                AND role_assignments.role_id IS NOT NULL
                LIMIT 1
            `;

            logger.info('Checking permission:', {
                userId: req.user.id,
                module,
                action
            });

            const hasPermission = await new Promise((resolve, reject) => {
                db.get(query, [req.user.id, req.user.id, module, action], (err, row) => {
                    if (err) {
                        // Ignore user_roles table error if it doesn't exist
                        if (err.message.includes('no such table: user_roles')) {
                            // Retry without user_roles
                            const fallbackQuery = `
                                SELECT DISTINCT 1
                                FROM permissions p
                                JOIN role_permissions rp ON p.id = rp.permission_id
                                JOIN roles r ON rp.role_id = r.id
                                JOIN group_roles gr ON r.id = gr.role_id
                                JOIN user_groups ug ON gr.group_id = ug.group_id
                                JOIN modules m ON p.module_id = m.id
                                WHERE ug.user_id = ?
                                AND m.name = ?
                                AND p.action = ?
                                LIMIT 1
                            `;
                            db.get(fallbackQuery, [req.user.id, module, action], (fallbackErr, fallbackRow) => {
                                if (fallbackErr) {
                                    logger.error('Fallback permission check failed:', { error: fallbackErr.message });
                                    reject(fallbackErr);
                                }
                                resolve(!!fallbackRow);
                            });
                        } else {
                            logger.error('Permission check failed:', { error: err.message });
                            reject(err);
                        }
                    } else {
                        resolve(!!row);
                    }
                });
            });

            logger.info('Permission check result:', {
                userId: req.user.id,
                module,
                action,
                hasPermission
            });

            if (!hasPermission) {
                logger.warn('Permission denied:', {
                    userId: req.user.id,
                    module,
                    action
                });
                return res.status(403).json({
                    error: 'Permission denied',
                    module,
                    action
                });
            }

            next();
        } catch (error) {
            logger.error('Permission check error:', { error: error.message });
            return res.status(500).json({ error: 'Internal server error' });
        }
    };
};