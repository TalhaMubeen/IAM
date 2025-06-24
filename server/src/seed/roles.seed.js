const { db } = require('../config/db.config');
const logger = require('../config/logger.config');

const roles = [
    {
        name: 'Super Admin',
        description: 'Has full access to all modules and permissions'
    },
    {
        name: 'Admin',
        description: 'Has access to manage users, groups, and roles'
    },
    {
        name: 'User',
        description: 'Basic user with limited permissions'
    }
];

const seedRoles = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            const stmt = db.prepare('INSERT OR IGNORE INTO roles (name, description) VALUES (?, ?)');
            
            roles.forEach(role => {
                stmt.run(role.name, role.description, (err) => {
                    if (err) {
                        logger.error(`Error seeding role ${role.name}:`, err);
                    } else {
                        logger.info(`Seeded role: ${role.name}`);
                    }
                });
            });

            stmt.finalize((err) => {
                if (err) {
                    logger.error('Error finalizing role seed:', err);
                    reject(err);
                } else {
                    logger.info('Role seeding completed');
                    resolve();
                }
            });
        });
    });
};

module.exports = seedRoles; 