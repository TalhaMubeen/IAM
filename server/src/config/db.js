const sqlite3 = require('sqlite3').verbose();
const logger = require('./logger.config');

// Create in-memory database
const db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        logger.error('Error connecting to database:', err);
        throw err;
    }
    logger.info('Connected to SQLite database');
});

// Initialize database tables
const initDatabase = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Enable foreign keys
            db.run('PRAGMA foreign_keys = ON');

            // Create users table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Create groups table
            db.run(`CREATE TABLE IF NOT EXISTS groups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Create roles table
            db.run(`CREATE TABLE IF NOT EXISTS roles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Create modules table
            db.run(`CREATE TABLE IF NOT EXISTS modules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Create permissions table
            db.run(`CREATE TABLE IF NOT EXISTS permissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                module_id INTEGER NOT NULL,
                action TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (module_id) REFERENCES modules(id),
                UNIQUE(module_id, action)
            )`);

            // Create user_groups table (many-to-many relationship)
            db.run(`CREATE TABLE IF NOT EXISTS user_groups (
                user_id INTEGER NOT NULL,
                group_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, group_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
            )`);

            // Create group_roles table (many-to-many relationship)
            db.run(`CREATE TABLE IF NOT EXISTS group_roles (
                group_id INTEGER NOT NULL,
                role_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (group_id, role_id),
                FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
                FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
            )`);

            // Create role_permissions table (many-to-many relationship)
            db.run(`CREATE TABLE IF NOT EXISTS role_permissions (
                role_id INTEGER NOT NULL,
                permission_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (role_id, permission_id),
                FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
                FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
            )`);

            // Create triggers for updated_at
            db.run(`CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
                AFTER UPDATE ON users
                BEGIN
                    UPDATE users SET updated_at = CURRENT_TIMESTAMP
                    WHERE id = NEW.id;
                END`);

            db.run(`CREATE TRIGGER IF NOT EXISTS update_groups_timestamp 
                AFTER UPDATE ON groups
                BEGIN
                    UPDATE groups SET updated_at = CURRENT_TIMESTAMP
                    WHERE id = NEW.id;
                END`);

            db.run(`CREATE TRIGGER IF NOT EXISTS update_roles_timestamp 
                AFTER UPDATE ON roles
                BEGIN
                    UPDATE roles SET updated_at = CURRENT_TIMESTAMP
                    WHERE id = NEW.id;
                END`);

            db.run(`CREATE TRIGGER IF NOT EXISTS update_modules_timestamp 
                AFTER UPDATE ON modules
                BEGIN
                    UPDATE modules SET updated_at = CURRENT_TIMESTAMP
                    WHERE id = NEW.id;
                END`);

            db.run(`CREATE TRIGGER IF NOT EXISTS update_permissions_timestamp 
                AFTER UPDATE ON permissions
                BEGIN
                    UPDATE permissions SET updated_at = CURRENT_TIMESTAMP
                    WHERE id = NEW.id;
                END`);
        }, (err) => {
            if (err) {
                logger.error('Error initializing database:', err);
                reject(err);
            } else {
                logger.info('Database initialized successfully');
                resolve();
            }
        });
    });
};

// Initialize database when the module is loaded
initDatabase().catch(err => {
    logger.error('Failed to initialize database:', err);
    process.exit(1);
});

module.exports = { db };
