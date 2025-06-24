const logger = require('../config/logger.config');
const { db } = require('../config/db.config');

class GroupService {
    async getAllGroups() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM groups', (err, groups) => {
                if (err) {
                    logger.error('Error fetching groups:', err);
                    reject(err);
                }
                resolve(groups);
            });
        });
    }

    async getGroupById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM groups WHERE id = ?', [id], (err, group) => {
                if (err) {
                    logger.error('Error fetching group:', err);
                    reject(err);
                }
                resolve(group);
            });
        });
    }

    async createGroup(groupData) {
        const { name, description } = groupData;

        // Check if group exists
        const existingGroup = await this.checkExistingGroup(name);
        if (existingGroup) {
            throw new Error('Group name already exists');
        }

        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO groups (name, description) VALUES (?, ?)',
                [name, description],
                function(err) {
                    if (err) {
                        logger.error('Error creating group:', err);
                        reject(err);
                    }
                    resolve({ id: this.lastID, name, description });
                }
            );
        });
    }

    async updateGroup(id, groupData) {
        const { name, description } = groupData;

        // Check if group exists
        const group = await this.getGroupById(id);
        if (!group) {
            throw new Error('Group not found');
        }

        // Check if new name is already taken
        if (name) {
            const existingGroup = await this.checkExistingGroup(name, id);
            if (existingGroup) {
                throw new Error('Group name already exists');
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
                `UPDATE groups SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                values,
                function(err) {
                    if (err) {
                        logger.error('Error updating group:', err);
                        reject(err);
                    }
                    resolve({ id, name: name || group.name, description: description || group.description });
                }
            );
        });
    }

    async deleteGroup(id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM groups WHERE id = ?', [id], function(err) {
                if (err) {
                    logger.error('Error deleting group:', err);
                    reject(err);
                }
                if (this.changes === 0) {
                    reject(new Error('Group not found'));
                }
                resolve(true);
            });
        });
    }

    async assignRoles(groupId, roleIds) {
        // Check if group exists
        const group = await this.getGroupById(groupId);
        if (!group) {
            throw new Error('Group not found');
        }

        return new Promise((resolve, reject) => {
            db.run('BEGIN TRANSACTION');

            db.run('DELETE FROM group_roles WHERE group_id = ?', [groupId], (err) => {
                if (err) {
                    logger.error('Error removing existing role assignments:', err);
                    db.run('ROLLBACK');
                    reject(err);
                    return;
                }

                const stmt = db.prepare('INSERT INTO group_roles (group_id, role_id) VALUES (?, ?)');
                let error = null;

                roleIds.forEach(roleId => {
                    stmt.run([groupId, roleId], (err) => {
                        if (err) {
                            error = err;
                        }
                    });
                });

                stmt.finalize();

                if (error) {
                    logger.error('Error assigning roles:', error);
                    db.run('ROLLBACK');
                    reject(error);
                    return;
                }

                db.run('COMMIT');
                resolve(true);
            });
        });
    }

    async getGroupRoles(groupId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT r.*
                FROM roles r
                JOIN group_roles gr ON r.id = gr.role_id
                WHERE gr.group_id = ?
            `;

            db.all(query, [groupId], (err, roles) => {
                if (err) {
                    logger.error('Error fetching group roles:', err);
                    reject(err);
                }
                resolve(roles);
            });
        });
    }

    async checkExistingGroup(name, excludeId = null) {
        return new Promise((resolve, reject) => {
            const query = excludeId
                ? 'SELECT * FROM groups WHERE name = ? AND id != ?'
                : 'SELECT * FROM groups WHERE name = ?';
            const params = excludeId ? [name, excludeId] : [name];

            db.get(query, params, (err, group) => {
                if (err) {
                    logger.error('Error checking existing group:', err);
                    reject(err);
                }
                resolve(group);
            });
        });
    }
}

module.exports = new GroupService(); 