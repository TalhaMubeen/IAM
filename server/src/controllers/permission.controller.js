const logger = require('../config/logger.config');
const permissionService = require('../services/permission.service');

class PermissionController {
    async getAllPermissions(req, res) {
        try {
            const permissions = await permissionService.getAllPermissions();
            res.json(permissions);
        } catch (error) {
            logger.error('Error fetching permissions:', error);
            res.status(500).json({ message: 'Error fetching permissions' });
        }
    }

    async getPermissionById(req, res) {
        try {
            const { id } = req.params;
            const permission = await permissionService.getPermissionById(id);
            
            if (!permission) {
                return res.status(404).json({ message: 'Permission not found' });
            }
            
            res.json(permission);
        } catch (error) {
            logger.error('Error fetching permission:', error);
            res.status(500).json({ message: 'Error fetching permission' });
        }
    }

    async createPermission(req, res) {
        try {
            const permission = await permissionService.createPermission(req.body);
            res.status(201).json({
                message: 'Permission created successfully',
                permission
            });
        } catch (error) {
            logger.error('Error creating permission:', error);
            if (error.message === 'Module not found') {
                return res.status(404).json({ message: error.message });
            }
            if (error.message === 'Permission already exists for this module and action') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error creating permission' });
        }
    }

    async updatePermission(req, res) {
        try {
            const { id } = req.params;
            const permission = await permissionService.updatePermission(id, req.body);
            res.json({
                message: 'Permission updated successfully',
                permission
            });
        } catch (error) {
            logger.error('Error updating permission:', error);
            if (error.message === 'Permission not found' || error.message === 'Module not found') {
                return res.status(404).json({ message: error.message });
            }
            if (error.message === 'Permission already exists for this module and action') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error updating permission' });
        }
    }

    async deletePermission(req, res) {
        try {
            const { id } = req.params;
            await permissionService.deletePermission(id);
            res.json({ message: 'Permission deleted successfully' });
        } catch (error) {
            logger.error('Error deleting permission:', error);
            if (error.message === 'Permission not found') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error deleting permission' });
        }
    }

    async getPermissionRoles(req, res) {
        try {
            const { id } = req.params;
            const roles = await permissionService.getPermissionRoles(id);
            res.json(roles);
        } catch (error) {
            logger.error('Error fetching permission roles:', error);
            res.status(500).json({ message: 'Error fetching permission roles' });
        }
    }
}

module.exports = new PermissionController(); 