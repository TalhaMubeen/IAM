const logger = require('../config/logger.config');
const { db } = require('../config/db.config');

class HealthService {
    async checkHealth() {
        return new Promise((resolve, reject) => {
            db.get('SELECT 1', (err) => {
                if (err) {
                    logger.error('Health check failed - Database error:', err);
                    reject(new Error('Database connection failed'));
                }

                resolve({
                    status: 'ok',
                    message: 'Service is healthy',
                    timestamp: new Date().toISOString(),
                    services: {
                        database: 'connected'
                    }
                });
            });
        });
    }
}

module.exports = new HealthService(); 