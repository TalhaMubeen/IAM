const express = require('express');
const router = express.Router();

// Import all routes
const authRoutes = require('./auth.route');
const userRoutes = require('./user.route');
const groupRoutes = require('./group.route');
const roleRoutes = require('./role.route');
const moduleRoutes = require('./module.route');
const permissionRoutes = require('./permission.route');
const healthRoutes = require('./health.route');

// Register routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/groups', groupRoutes);
router.use('/roles', roleRoutes);
router.use('/modules', moduleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/health', healthRoutes);

module.exports = router;
