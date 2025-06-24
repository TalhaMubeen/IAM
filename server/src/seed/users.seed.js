const { db } = require('../config/db.config');
const logger = require('../config/logger.config');
const bcrypt = require('bcryptjs');

const users = [
    {
        username: 'admin',
        email: 'admin@admin.com',
        password: 'Admin@123'
    },
    {
        username: 'test',
        email: 'test@test.com',
        password: 'Test@123'
    }
];

const seedUsers = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            const stmt = db.prepare('INSERT OR IGNORE INTO users (username, email, password) VALUES (?, ?, ?)');
            Promise.all(users.map(async user => {
                try {
                    const hashedPassword = await bcrypt.hash(user.password, 10);
                    return new Promise((resolveUser, rejectUser) => {
                        stmt.run(user.username, user.email, hashedPassword, (err) => {
                            if (err) {
                                logger.error(`Error seeding user ${user.username}:`, err);
                                rejectUser(err);
                            } else {
                                logger.info(`Seeded user: ${user.username}`);
                                resolveUser();
                            }
                        });
                    });
                } catch (error) {
                    logger.error(`Error hashing password for user ${user.username}:`, error);
                    throw error;
                }
            }))
                .then(() => {
                    stmt.finalize((err) => {
                        if (err) {
                            logger.error('Error finalizing user seed:', err);
                            reject(err);
                        } else {
                            logger.info('User seeding completed');
                            resolve();
                        }
                    });
                })
                .catch(reject);
        });
    });
};

module.exports = seedUsers;