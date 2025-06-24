const logger = require('../config/logger.config');
const authService = require('../services/auth.service');

class AuthController {
    async register(req, res) {
        try {
            const result = await authService.register(req.body);
            res.status(201).json({
                message: 'User created successfully',
                ...result
            });
        } catch (error) {
            logger.error('Registration error:', error);
            if (error.message === 'Username or email already exists') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error registering user' });
        }
    }

    async login(req, res) {
        try {
            const result = await authService.login(req.body);
            res.status(200).json({
                message: 'Login successful',
                token: result.token,
                user: result.user
            });
        } catch (error) {
            logger.error('Login error:', error);
            if (error.message === 'Invalid credentials') {
                return res.status(401).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error logging in' });
        }
    }

    async getCurrentUser(req, res) {
        try {
            const user = await authService.getCurrentUser(req.user.id);
            res.json(user);
        } catch (error) {
            logger.error('Error fetching current user:', error);
            if (error.message === 'User not found') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error fetching current user' });
        }
    }

    async getUserPermissions(req, res) {
        try {
            const userId = req.user.id;
            logger.info('Fetching permissions for user:', userId);
            const result = await authService.getUserPermissions(userId);
            logger.info('Grouped permissions:', result);
            res.json(result);
        } catch (error) {
            logger.error('Error fetching permissions:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    async simulateAction(req, res) {
        try {
            const { module, action } = req.body;
            const userId = req.user.id;

            if (!module || !action) {
                return res.status(400).json({
                    success: false,
                    message: 'Module and action are required'
                });
            }

            const hasPermission = await authService.checkPermission(userId, module, action);
            res.json({
                success: true,
                hasPermission,
                message: hasPermission
                    ? `You have permission to ${action} on ${module}`
                    : `You do not have permission to ${action} on ${module}`
            });
        } catch (error) {
            logger.error('Error in simulate-action:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
}

module.exports = new AuthController();