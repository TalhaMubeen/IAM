const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { createUserSchema, updateUserSchema, assignGroupsSchema } = require('../validators');
const { checkPermission } = require('../middleware/checkPermission.middleware');
const userController = require('../controllers/user.controller');

// Get all user
router.get('/', verifyToken, checkPermission('user', 'read'), userController.getAllUsers);

// Get user by ID
router.get('/:id', verifyToken, checkPermission('user', 'read'), userController.getUserById);

// Create user
router.post('/', verifyToken, checkPermission('user', 'create'), validate(createUserSchema), userController.createUser);

// Update user
router.put('/:id', verifyToken, checkPermission('user', 'update'), validate(updateUserSchema), userController.updateUser);

// Delete user
router.delete('/:id', verifyToken, checkPermission('user', 'delete'), userController.deleteUser);

// Assign groups to user
router.post('/:id/groups', verifyToken, checkPermission('user', 'update'), validate(assignGroupsSchema), userController.assignGroups);

module.exports = router;
