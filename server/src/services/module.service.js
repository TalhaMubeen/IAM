const logger = require('../config/logger.config');
const { db } = require('../config/db.config');

class ModuleService {
    async getAllModules() {
        return new Promise((resolve, reject) => {
            logger.info('Executing getAllModules query');
            const query = `
                SELECT 
                    m.id,
                    m.name,
                    m.description,
                    m.created_at,
                    m.updated_at,
                    GROUP_CONCAT(p.action) AS permissions
                FROM modules m
                LEFT JOIN permissions p ON m.id = p.module_id
                GROUP BY m.id, m.name, m.description, m.created_at, m.updated_at
            `;
            db.all(query, (err, modules) => {
                if (err) {
                    logger.error('Error fetching modules:', err);
                    reject(err);
                    return;
                }
                logger.info('Modules fetched from database:', { count: modules.length });
                // Parse permissions into an array
                const parsedModules = modules.map(module => ({
                    ...module,
                    permissions: module.permissions ? module.permissions.split(',') : []
                }));
                resolve(parsedModules);
            });
        });
    }

    async getModuleById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM modules WHERE id = ?', [id], (err, module) => {
                if (err) {
                    logger.error('Error fetching module:', err);
                    reject(err);
                }
                resolve(module);
            });
        });
    }

    async createModule(moduleData) {
        const { name, description } = moduleData;

        // Check if module name already exists
        const existingModule = await this.checkModuleNameExists(name);
        if (existingModule) {
            throw new Error('Module name already exists');
        }

        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO modules (name, description) VALUES (?, ?)',
                [name, description],
                function(err) {
                    if (err) {
                        logger.error('Error creating module:', err);
                        reject(err);
                    }
                    resolve({ id: this.lastID, name, description });
                }
            );
        });
    }

    async updateModule(id, moduleData) {
        const { name, description } = moduleData;

        // Check if module exists
        const module = await this.getModuleById(id);
        if (!module) {
            throw new Error('Module not found');
        }

        // Check if new name is already taken
        if (name) {
            const existingModule = await this.checkModuleNameExists(name, id);
            if (existingModule) {
                throw new Error('Module name already exists');
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
                `UPDATE modules SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                values,
                function(err) {
                    if (err) {
                        logger.error('Error updating module:', err);
                        reject(err);
                    }
                    resolve({
                        id,
                        name: name || module.name,
                        description: description || module.description
                    });
                }
            );
        });
    }

    async deleteModule(id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM modules WHERE id = ?', [id], function(err) {
                if (err) {
                    logger.error('Error deleting module:', err);
                    reject(err);
                }
                if (this.changes === 0) {
                    reject(new Error('Module not found'));
                }
                resolve(true);
            });
        });
    }

    async getModulePermissions(moduleId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT p.*
                FROM permissions p
                WHERE p.module_id = ?
            `;

            db.all(query, [moduleId], (err, permissions) => {
                if (err) {
                    logger.error('Error fetching module permissions:', err);
                    reject(err);
                }
                resolve(permissions);
            });
        });
    }

    async checkModuleNameExists(name, excludeId = null) {
        return new Promise((resolve, reject) => {
            const query = excludeId
                ? 'SELECT * FROM modules WHERE name = ? AND id != ?'
                : 'SELECT * FROM modules WHERE name = ?';
            const params = excludeId ? [name, excludeId] : [name];

            db.get(query, params, (err, module) => {
                if (err) {
                    logger.error('Error checking module name:', err);
                    reject(err);
                }
                resolve(module);
            });
        });
    }
}

module.exports = new ModuleService();