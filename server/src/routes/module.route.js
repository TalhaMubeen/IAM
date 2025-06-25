const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { createModuleSchema, updateModuleSchema } = require('../validators');
const { checkPermission } = require('../middleware/checkPermission.middleware');
const moduleController = require('../controllers/module.controller');

// Get all module
router.get('/', verifyToken, checkPermission('module', 'read'), moduleController.getAllModules);

// Get module by ID
router.get('/:id', verifyToken, checkPermission('module', 'read'), moduleController.getModuleById);

// Create module
router.post('/', verifyToken, checkPermission('module', 'create'), validate(createModuleSchema), moduleController.createModule);

// Update module
router.put('/:id', verifyToken, checkPermission('module', 'update'), validate(updateModuleSchema), moduleController.updateModule);

// Delete module
router.delete('/:id', verifyToken, checkPermission('module', 'delete'), moduleController.deleteModule);

// Get module's permissions
router.get('/:id/permissions', verifyToken, checkPermission('module', 'read'), moduleController.getModulePermissions);

module.exports = router;