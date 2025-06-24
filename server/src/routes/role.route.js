const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { createRoleSchema, updateRoleSchema, assignPermissionsSchema } = require('../validators');
const { checkPermission } = require('../middleware/checkPermission.middleware');
const roleController = require('../controllers/role.controller');

// Get all roles
router.get('/', verifyToken, checkPermission('roles', 'read'), roleController.getAllRoles);

// Get role by ID
router.get('/:id', verifyToken, checkPermission('roles', 'read'), roleController.getRoleById);

// Create role
router.post('/', verifyToken, checkPermission('roles', 'create'), validate(createRoleSchema), roleController.createRole);

// Update role
router.put('/:id', verifyToken, checkPermission('roles', 'update'), validate(updateRoleSchema), roleController.updateRole);

// Delete role
router.delete('/:id', verifyToken, checkPermission('roles', 'delete'), roleController.deleteRole);

// Assign permissions to role
router.post('/:id/permissions', verifyToken, checkPermission('roles', 'update'), validate(assignPermissionsSchema), roleController.assignPermissions);

// Get role's permissions
router.get('/:id/permissions', verifyToken, checkPermission('roles', 'read'), roleController.getRolePermissions);

module.exports = router;
