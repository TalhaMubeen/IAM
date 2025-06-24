const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { registerSchema, loginSchema } = require('../validators');
const authController = require('../controllers/auth.controller');

// Register new user
router.post('/register', validate(registerSchema), authController.register);

// Login user
router.post('/login', validate(loginSchema), authController.login);

// Get current user
router.get('/me', verifyToken, authController.getCurrentUser);

// Get user permissions
router.get('/me/permissions', verifyToken, authController.getUserPermissions);

// Simulate action endpoint
router.post('/simulate-action', verifyToken, authController.simulateAction);

module.exports = router;