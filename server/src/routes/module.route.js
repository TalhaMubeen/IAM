const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { createModuleSchema, updateModuleSchema } = require('../validators');
const { checkPermission } = require('../middleware/checkPermission.middleware');
const moduleController = require('../controllers/module.controller');

// Get all modules
router.get('/', verifyToken, checkPermission('modules', 'read'), moduleController.getAllModules);

// Get module by ID
router.get('/:id', verifyToken, checkPermission('modules', 'read'), moduleController.getModuleById);

// Create module
router.post('/', verifyToken, checkPermission('modules', 'create'), validate(createModuleSchema), moduleController.createModule);

// Update module
router.put('/:id', verifyToken, checkPermission('modules', 'update'), validate(updateModuleSchema), moduleController.updateModule);

// Delete module
router.delete('/:id', verifyToken, checkPermission('modules', 'delete'), moduleController.deleteModule);

// Get module's permissions
router.get('/:id/permissions', verifyToken, checkPermission('modules', 'read'), moduleController.getModulePermissions);

module.exports = router;