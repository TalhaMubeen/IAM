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
    if (!module || !action) {
        throw new Error('Module and action are required');
    }
    if (!['create', 'read', 'update', 'delete'].includes(action.toLowerCase())) {
        throw new Error('Invalid action. Must be one of: create, read, update, delete');
    }
};

// Cache for frequently checked permissions
const permissionCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (userId, module, action) => `${userId}:${module}:${action}`;

const checkPermissionInCache = (userId, module, action) => {
    const cacheKey = getCacheKey(userId, module, action);
    const cached = permissionCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.allowed;
    }

    return null;
};

const setPermissionInCache = (userId, module, action, allowed) => {
    const cacheKey = getCacheKey(userId, module, action);
    permissionCache.set(cacheKey, {
        allowed,
        timestamp: Date.now()
    });
};

// Permission checking middleware
module.exports.checkPermission = (module, action) => {
    return async (req, res, next) => {
        try {
            // Basic validation
            validateInput(module, action);

            // Check authentication
            if (!req.user?.id) {
                return res.status(401).json({
                    error: 'Authentication required'
                });
            }

            // Check cache first
            // const cachedPermission = checkPermissionInCache(req.user.id, module, action);
            // if (cachedPermission !== null) {
            //     if (cachedPermission) {
            //         return next();
            //     } else {
            //         return res.status(403).json({
            //             error: 'Permission denied',
            //             module,
            //             action
            //         });
            //     }
            // }

            // Simple permission check query
            const query = `
                SELECT 1
                FROM permissions p
                JOIN role_permissions rp ON p.id = rp.permission_id
                JOIN group_roles gr ON rp.role_id = gr.role_id
                JOIN user_groups ug ON gr.group_id = ug.group_id
                WHERE ug.user_id = ? 
                AND p.module_id = (SELECT id FROM modules WHERE name = ?)
                AND p.action = ?
                LIMIT 1
            `;

            logger.info('Checking permission:', {
                userId: req.user.id,
                module,
                action
            });

            const hasPermission = await new Promise((resolve, reject) => {
                db.get(query, [req.user.id, module, action], (err, row) => {
                    if (err) {
                        logger.error('Permission check failed:', err);
                        reject(err);
                        return;
                    }
                    resolve(!!row);
                });
            });

            // Cache the result
            setPermissionInCache(req.user.id, module, action, hasPermission);

            logger.info('Permission check result:', {
                userId: req.user.id,
                module,
                action,
                hasPermission
            });

            if (!hasPermission) {
                return res.status(403).json({
                    error: 'Permission denied',
                    module,
                    action
                });
            }

            next();
        } catch (error) {
            logger.error('Permission check error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    };
};