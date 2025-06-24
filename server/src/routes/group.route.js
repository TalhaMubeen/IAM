const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { createGroupSchema, updateGroupSchema, assignRolesSchema } = require('../validators');
const { checkPermission } = require('../middleware/checkPermission.middleware');
const groupController = require('../controllers/group.controller');

// Get all groups
router.get('/', verifyToken, checkPermission('groups', 'read'), groupController.getAllGroups);

// Get group by ID
router.get('/:id', verifyToken, checkPermission('groups', 'read'), groupController.getGroupById);

// Create group
router.post('/', verifyToken, checkPermission('groups', 'create'), validate(createGroupSchema), groupController.createGroup);

// Update group
router.put('/:id', verifyToken, checkPermission('groups', 'update'), validate(updateGroupSchema), groupController.updateGroup);

// Delete group
router.delete('/:id', verifyToken, checkPermission('groups', 'delete'), groupController.deleteGroup);

// Assign roles to group
router.post('/:id/roles', verifyToken, checkPermission('groups', 'update'), validate(assignRolesSchema), groupController.assignRoles);

// Get group's roles
router.get('/:id/roles', verifyToken, checkPermission('groups', 'read'), groupController.getGroupRoles);

module.exports = router;
