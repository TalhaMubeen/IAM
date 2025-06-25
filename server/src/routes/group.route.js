const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { createGroupSchema, updateGroupSchema, assignRolesSchema } = require('../validators');
const { checkPermission } = require('../middleware/checkPermission.middleware');
const groupController = require('../controllers/group.controller');

// Get all group
router.get('/', verifyToken, checkPermission('group', 'read'), groupController.getAllGroups);

// Get group by ID
router.get('/:id', verifyToken, checkPermission('group', 'read'), groupController.getGroupById);

// Create group
router.post('/', verifyToken, checkPermission('group', 'create'), validate(createGroupSchema), groupController.createGroup);

// Update group
router.put('/:id', verifyToken, checkPermission('group', 'update'), validate(updateGroupSchema), groupController.updateGroup);

// Delete group
router.delete('/:id', verifyToken, checkPermission('group', 'delete'), groupController.deleteGroup);

// Assign roles to group
router.post('/:id/roles', verifyToken, checkPermission('group', 'update'), validate(assignRolesSchema), groupController.assignRoles);

// Get group's roles
router.get('/:id/roles', verifyToken, checkPermission('group', 'read'), groupController.getGroupRoles);

module.exports = router;
