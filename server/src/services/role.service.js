const logger = require('../config/logger.config');
const { db } = require('../config/db.config');

class RoleService {
    async getAllRoles() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM roles', (err, roles) => {
                if (err) {
                    logger.error('Error fetching roles:', err);
                    reject(err);
                }
                resolve(roles);
            });
        });
    }

    async getRoleById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM roles WHERE id = ?', [id], (err, role) => {
                if (err) {
                    logger.error('Error fetching role:', err);
                    reject(err);
                }
                resolve(role);
            });
        });
    }

    async createRole(roleData) {
        const { name, description } = roleData;

        // Check if role exists
        const existingRole = await this.checkExistingRole(name);
        if (existingRole) {
            throw new Error('Role name already exists');
        }

        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO roles (name, description) VALUES (?, ?)',
                [name, description],
                function(err) {
                    if (err) {
                        logger.error('Error creating role:', err);
                        reject(err);
                    }
                    resolve({ id: this.lastID, name, description });
                }
            );
        });
    }

    async updateRole(id, roleData) {
        const { name, description } = roleData;

        // Check if role exists
        const role = await this.getRoleById(id);
        if (!role) {
            throw new Error('Role not found');
        }

        // Check if new name is already taken
        if (name) {
            const existingRole = await this.checkExistingRole(name, id);
            if (existingRole) {
                throw new Error('Role name already exists');
            }
        }

        const updates = [];
        const values = [];

        if (name) {
            updates.push('name = ?');
            values.push(name);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            values.push(description);
        }

        values.push(id);

        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE roles SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                values,
                function(err) {
                    if (err) {
                        logger.error('Error updating role:', err);
                        reject(err);
                    }
                    resolve({ id, name: name || role.name, description: description || role.description });
                }
            );
        });
    }

    async deleteRole(id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM roles WHERE id = ?', [id], function(err) {
                if (err) {
                    logger.error('Error deleting role:', err);
                    reject(err);
                }
                if (this.changes === 0) {
                    reject(new Error('Role not found'));
                }
                resolve(true);
            });
        });
    }

    async assignPermissions(roleId, permissionIds) {
        // Check if role exists
        const role = await this.getRoleById(roleId);
        if (!role) {
            throw new Error('Role not found');
        }

        return new Promise((resolve, reject) => {
            db.run('BEGIN TRANSACTION');

            db.run('DELETE FROM role_permissions WHERE role_id = ?', [roleId], (err) => {
                if (err) {
                    logger.error('Error removing existing permission assignments:', err);
                    db.run('ROLLBACK');
                    reject(err);
                    return;
                }

                const stmt = db.prepare('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)');
                let error = null;

                permissionIds.forEach(permissionId => {
                    stmt.run([roleId, permissionId], (err) => {
                        if (err) {
                            error = err;
                        }
                    });
                });

                stmt.finalize();

                if (error) {
                    logger.error('Error assigning permissions:', error);
                    db.run('ROLLBACK');
                    reject(error);
                    return;
                }

                db.run('COMMIT');
                resolve(true);
            });
        });
    }

    async getRolePermissions(roleId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT p.*, m.name as module_name
                FROM permissions p
                JOIN role_permissions rp ON p.id = rp.permission_id
                JOIN modules m ON p.module_id = m.id
                WHERE rp.role_id = ?
            `;

            db.all(query, [roleId], (err, permissions) => {
                if (err) {
                    logger.error('Error fetching role permissions:', err);
                    reject(err);
                }
                resolve(permissions);
            });
        });
    }

    async checkExistingRole(name, excludeId = null) {
        return new Promise((resolve, reject) => {
            const query = excludeId
                ? 'SELECT * FROM roles WHERE name = ? AND id != ?'
                : 'SELECT * FROM roles WHERE name = ?';
            const params = excludeId ? [name, excludeId] : [name];

            db.get(query, params, (err, role) => {
                if (err) {
                    logger.error('Error checking existing role:', err);
                    reject(err);
                }
                resolve(role);
            });
        });
    }
}

module.exports = new RoleService(); 