const logger = require('../config/logger.config');
const { db } = require('../config/db.config');

class PermissionService {
    async getAllPermissions() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT p.*, m.name as module_name
                FROM permissions p
                JOIN modules m ON p.module_id = m.id
            `;

            db.all(query, (err, permissions) => {
                if (err) {
                    logger.error('Error fetching permissions:', err);
                    reject(err);
                }
                resolve(permissions);
            });
        });
    }

    async getPermissionById(id) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT p.*, m.name as module_name
                FROM permissions p
                JOIN modules m ON p.module_id = m.id
                WHERE p.id = ?
            `;

            db.get(query, [id], (err, permission) => {
                if (err) {
                    logger.error('Error fetching permission:', err);
                    reject(err);
                }
                resolve(permission);
            });
        });
    }

    async createPermission(permissionData) {
        const { module_id, action } = permissionData;

        // Check if module exists
        const module = await this.checkModuleExists(module_id);
        if (!module) {
            throw new Error('Module not found');
        }

        // Check if permission already exists
        const existingPermission = await this.checkExistingPermission(module_id, action);
        if (existingPermission) {
            throw new Error('Permission already exists for this module and action');
        }

        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO permissions (module_id, action) VALUES (?, ?)',
                [module_id, action],
                function(err) {
                    if (err) {
                        logger.error('Error creating permission:', err);
                        reject(err);
                    }
                    resolve({ id: this.lastID, module_id, action });
                }
            );
        });
    }

    async updatePermission(id, permissionData) {
        const { module_id, action } = permissionData;

        // Check if permission exists
        const permission = await this.getPermissionById(id);
        if (!permission) {
            throw new Error('Permission not found');
        }

        // Check if module exists if module_id is provided
        if (module_id) {
            const module = await this.checkModuleExists(module_id);
            if (!module) {
                throw new Error('Module not found');
            }
        }

        // Check if new permission already exists
        const existingPermission = await this.checkExistingPermission(
            module_id || permission.module_id,
            action || permission.action,
            id
        );
        if (existingPermission) {
            throw new Error('Permission already exists for this module and action');
        }

        const updates = [];
        const values = [];

        if (module_id) {
            updates.push('module_id = ?');
            values.push(module_id);
        }
        if (action) {
            updates.push('action = ?');
            values.push(action);
        }

        values.push(id);

        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE permissions SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                values,
                function(err) {
                    if (err) {
                        logger.error('Error updating permission:', err);
                        reject(err);
                    }
                    resolve({
                        id,
                        module_id: module_id || permission.module_id,
                        action: action || permission.action
                    });
                }
            );
        });
    }

    async deletePermission(id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM permissions WHERE id = ?', [id], function(err) {
                if (err) {
                    logger.error('Error deleting permission:', err);
                    reject(err);
                }
                if (this.changes === 0) {
                    reject(new Error('Permission not found'));
                }
                resolve(true);
            });
        });
    }

    async getPermissionRoles(permissionId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT r.*
                FROM roles r
                JOIN role_permissions rp ON r.id = rp.role_id
                WHERE rp.permission_id = ?
            `;

            db.all(query, [permissionId], (err, roles) => {
                if (err) {
                    logger.error('Error fetching permission roles:', err);
                    reject(err);
                }
                resolve(roles);
            });
        });
    }

    async checkModuleExists(moduleId) {
        return new Promise((resolve, reject) => {
            db.get('SELECT id FROM modules WHERE id = ?', [moduleId], (err, module) => {
                if (err) {
                    logger.error('Error checking module:', err);
                    reject(err);
                }
                resolve(module);
            });
        });
    }

    async checkExistingPermission(moduleId, action, excludeId = null) {
        return new Promise((resolve, reject) => {
            const query = excludeId
                ? 'SELECT * FROM permissions WHERE module_id = ? AND action = ? AND id != ?'
                : 'SELECT * FROM permissions WHERE module_id = ? AND action = ?';
            const params = excludeId ? [moduleId, action, excludeId] : [moduleId, action];

            db.get(query, params, (err, permission) => {
                if (err) {
                    logger.error('Error checking existing permission:', err);
                    reject(err);
                }
                resolve(permission);
            });
        });
    }
}

module.exports = new PermissionService(); 