const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { createUserSchema, updateUserSchema, assignGroupsSchema } = require('../validators');
const { checkPermission } = require('../middleware/checkPermission.middleware');
const userController = require('../controllers/user.controller');

// Get all users
router.get('/', verifyToken, checkPermission('users', 'read'), userController.getAllUsers);

// Get user by ID
router.get('/:id', verifyToken, checkPermission('users', 'read'), userController.getUserById);

// Create user
router.post('/', verifyToken, checkPermission('users', 'create'), validate(createUserSchema), userController.createUser);

// Update user
router.put('/:id', verifyToken, checkPermission('users', 'update'), validate(updateUserSchema), userController.updateUser);

// Delete user
router.delete('/:id', verifyToken, checkPermission('users', 'delete'), userController.deleteUser);

// Assign groups to user
router.post('/:id/groups', verifyToken, checkPermission('users', 'update'), validate(assignGroupsSchema), userController.assignGroups);

module.exports = router;
