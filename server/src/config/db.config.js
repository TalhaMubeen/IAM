const sqlite3 = require('sqlite3').verbose();

const dbPath = process.env.DB_PATH || ':memory:';
const db = new sqlite3.Database(dbPath);

module.exports = {
    db
};