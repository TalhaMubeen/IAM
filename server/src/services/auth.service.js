const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger.config');
const { db } = require('../config/db.config');

class AuthService {
    async register(userData) {
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
                    const token = jwt.sign(
                        { id: this.lastID, username },
                        process.env.JWT_SECRET,
                        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
                    );
                    resolve({
                        token,
                        user: { id: this.lastID, username, email }
                    });
                }
            );
        });
    }

    async login(credentials) {
        const { username, email, password } = credentials;

        if (!password) {
            throw new Error('Password is required');
        }

        if (!username && !email) {
            throw new Error('Username or email is required');
        }

        const user = await this.findUserByUsernameOrEmail(username || email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            throw new Error('Invalid credentials');
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        // Return only necessary data
        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        };
    }

    async getCurrentUser(userId) {
        return new Promise((resolve, reject) => {
            db.get('SELECT id, username, email FROM users WHERE id = ?', [userId], (err, user) => {
                if (err) {
                    logger.error('Error fetching user:', err);
                    reject(err);
                }
                if (!user) {
                    reject(new Error('User not found'));
                }
                resolve(user);
            });
        });
    }

    async getUserPermissions(userId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT DISTINCT m.name as module, p.action
                FROM permissions p
                JOIN role_permissions rp ON p.id = rp.permission_id
                JOIN roles r ON rp.role_id = r.id
                JOIN group_roles gr ON r.id = gr.role_id
                JOIN user_groups ug ON gr.group_id = ug.group_id
                JOIN modules m ON p.module_id = m.id
                WHERE ug.user_id = ?
            `;

            logger.info('Fetching permissions for user:', userId);
            logger.info('SQL Query:', query);

            db.all(query, [userId], (err, permissions) => {
                if (err) {
                    logger.error('Error fetching permissions:', err);
                    reject(err);
                    return;
                }

                logger.info('Raw permissions:', permissions);

                if (!permissions || permissions.length === 0) {
                    logger.info('No permissions found for user:', userId);
                    resolve({ permissions: {} });
                    return;
                }

                const groupedPermissions = permissions.reduce((acc, curr) => {
                    if (!acc[curr.module]) {
                        acc[curr.module] = [];
                    }
                    acc[curr.module].push(curr.action);
                    return acc;
                }, {});

                logger.info('Grouped permissions:', groupedPermissions);
                resolve({ permissions: groupedPermissions });
            });
        });
    }

    async checkPermission(userId, module, action) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT p.action 
                FROM permissions p
                JOIN role_permissions rp ON p.id = rp.permission_id
                JOIN group_roles gr ON rp.role_id = gr.role_id
                JOIN user_groups ug ON gr.group_id = ug.group_id
                JOIN modules m ON p.module_id = m.id
                WHERE ug.user_id = ? AND m.name = ? AND p.action = ?
            `;

            db.get(query, [userId, module, action], (err, row) => {
                if (err) {
                    logger.error('Error checking permission:', err);
                    reject(err);
                }
                resolve(!!row);
            });
        });
    }

    async checkExistingUser(username, email) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], (err, user) => {
                if (err) {
                    logger.error('Error checking existing user:', err);
                    reject(err);
                }
                resolve(user);
            });
        });
    }

    async findUserByUsernameOrEmail(usernameOrEmail) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE username = ? OR email = ?', [usernameOrEmail, usernameOrEmail], (err, user) => {
                if (err) {
                    logger.error('Error finding user:', err);
                    reject(err);
                }
                resolve(user);
            });
        });
    }
}

module.exports = new AuthService();