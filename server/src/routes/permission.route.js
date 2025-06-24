const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { createPermissionSchema, updatePermissionSchema } = require('../validators');
const { checkPermission } = require('../middleware/checkPermission.middleware');
const permissionController = require('../controllers/permission.controller');

// Get all permissions
router.get('/', verifyToken, checkPermission('permissions', 'read'), permissionController.getAllPermissions);

// Get permission by ID
router.get('/:id', verifyToken, checkPermission('permissions', 'read'), permissionController.getPermissionById);

// Create permission
router.post('/', verifyToken, checkPermission('permissions', 'create'), validate(createPermissionSchema), permissionController.createPermission);

// Update permission
router.put('/:id', verifyToken, checkPermission('permissions', 'update'), validate(updatePermissionSchema), permissionController.updatePermission);

// Delete permission
router.delete('/:id', verifyToken, checkPermission('permissions', 'delete'), permissionController.deletePermission);

// Get permission's roles
router.get('/:id/roles', verifyToken, checkPermission('permissions', 'read'), permissionController.getPermissionRoles);

module.exports = router;