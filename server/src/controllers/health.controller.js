const logger = require('../config/logger.config');
const healthService = require('../services/health.service');

class HealthController {
    async checkHealth(req, res) {
        try {
            const healthStatus = await healthService.checkHealth();
            res.json(healthStatus);
        } catch (error) {
            logger.error('Health check failed:', error);
            res.status(503).json({
                status: 'error',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
}

module.exports = new HealthController(); 