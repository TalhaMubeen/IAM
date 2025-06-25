const bcrypt = require('bcrypt');
const logger = require('../config/logger.config');
const { db } = require('../config/db.config');

class UserService {
    async getAllUsers() {
        return new Promise((resolve, reject) => {
            logger.info('Executing getAllUsers query');
            const query = `
                SELECT 
                    u.id,
                    u.username,
                    u.email,
                    u.created_at,
                    GROUP_CONCAT(g.name) AS groups
                FROM users u
                LEFT JOIN user_groups ug ON u.id = ug.user_id
                LEFT JOIN groups g ON ug.group_id = g.id
                GROUP BY u.id, u.username, u.email, u.created_at
            `;
            db.all(query, (err, users) => {
                if (err) {
                    logger.error('Error fetching users:', err);
                    reject(err);
                    return;
                }
                logger.info('Users fetched from database:', { count: users.length });
                // Parse groups into an array
                const parsedUsers = users.map(user => ({
                    ...user,
                    groups: user.groups ? user.groups.split(',') : []
                }));
                resolve(parsedUsers);
            });
        });
    }

    async getUserById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT id, username, email, created_at FROM users WHERE id = ?', [id], (err, user) => {
                if (err) {
                    logger.error('Error fetching user:', err);
                    reject(err);
                }
                resolve(user);
            });
        });
    }

    async createUser(userData) {
        const { username, password, email } = userData;
        
        // Check if user exists
        const existingUser = await this.checkExistingUser(username, email);
        if (existingUser) {
            throw new Error('Username or email already exists');
        }

        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
                [username, hashedPassword, email],
                function(err) {
                    if (err) {
                        logger.error('Error creating user:', err);
                        reject(err);
                    }
                    resolve({ id: this.lastID, username, email });
                }
            );
        });
    }

    async updateUser(id, userData) {
        const { username, email, password } = userData;

        // Check if user exists
        const user = await this.getUserById(id);
        if (!user) {
            throw new Error('User not found');
        }

        // Check if new username/email is already taken
        if (username || email) {
            const existingUser = await this.checkExistingUser(
                username || user.username,
                email || user.email,
                id
            );
            if (existingUser) {
                throw new Error('Username or email already exists');
            }
        }

        const updates = [];
        const values = [];

        if (username) {
            updates.push('username = ?');
            values.push(username);
        }
        if (email) {
            updates.push('email = ?');
            values.push(email);
        }
        if (password) {
            const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            updates.push('password = ?');
            values.push(hashedPassword);
        }

        values.push(id);

        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                values,
                function(err) {
                    if (err) {
                        logger.error('Error updating user:', err);
                        reject(err);
                    }
                    resolve({ id, username: username || user.username, email: email || user.email });
                }
            );
        });
    }

    async deleteUser(id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
                if (err) {
                    logger.error('Error deleting user:', err);
                    reject(err);
                }
                if (this.changes === 0) {
                    reject(new Error('User not found'));
                }
                resolve(true);
            });
        });
    }

    async assignGroup(userId, groupId) {
        // Check if user exists
        const user = await this.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        return new Promise((resolve, reject) => {
            db.run('BEGIN TRANSACTION');

            db.run('DELETE FROM user_groups WHERE user_id = ?', [userId], (err) => {
                if (err) {
                    logger.error('Error removing existing group assignments:', err);
                    db.run('ROLLBACK');
                    reject(err);
                    return;
                }

                const stmt = db.prepare('INSERT INTO user_groups (user_id, group_id) VALUES (?, ?)');
                let error = null;

                stmt.run([userId, groupId], (err) => {
                    if (err) {
                        error = err;
                    }
                });

                stmt.finalize();

                if (error) {
                    logger.error('Error assigning groups:', error);
                    db.run('ROLLBACK');
                    reject(error);
                    return;
                }

                db.run('COMMIT');
                resolve(true);
            });
        });
    }

    async checkExistingUser(username, email, excludeId = null) {
        return new Promise((resolve, reject) => {
            const query = excludeId
                ? 'SELECT * FROM users WHERE (username = ? OR email = ?) AND id != ?'
                : 'SELECT * FROM users WHERE username = ? OR email = ?';
            const params = excludeId ? [username, email, excludeId] : [username, email];

            db.get(query, params, (err, user) => {
                if (err) {
                    logger.error('Error checking existing user:', err);
                    reject(err);
                }
                resolve(user);
            });
        });
    }
}

module.exports = new UserService(); 