const logger = require('../config/logger.config');
const roleService = require('../services/role.service');

class RoleController {
    async getAllRoles(req, res) {
        try {
            const roles = await roleService.getAllRoles();
            res.json(roles);
        } catch (error) {
            logger.error('Error fetching roles:', error);
            res.status(500).json({ message: 'Error fetching roles' });
        }
    }

    async getRoleById(req, res) {
        try {
            const { id } = req.params;
            const role = await roleService.getRoleById(id);
            
            if (!role) {
                return res.status(404).json({ message: 'Role not found' });
            }
            
            res.json(role);
        } catch (error) {
            logger.error('Error fetching role:', error);
            res.status(500).json({ message: 'Error fetching role' });
        }
    }

    async createRole(req, res) {
        try {
            const role = await roleService.createRole(req.body);
            res.status(201).json({
                message: 'Role created successfully',
                role
            });
        } catch (error) {
            logger.error('Error creating role:', error);
            if (error.message === 'Role name already exists') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error creating role' });
        }
    }

    async updateRole(req, res) {
        try {
            const { id } = req.params;
            const role = await roleService.updateRole(id, req.body);
            res.json({
                message: 'Role updated successfully',
                role
            });
        } catch (error) {
            logger.error('Error updating role:', error);
            if (error.message === 'Role not found') {
                return res.status(404).json({ message: error.message });
            }
            if (error.message === 'Role name already exists') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error updating role' });
        }
    }

    async deleteRole(req, res) {
        try {
            const { id } = req.params;
            await roleService.deleteRole(id);
            res.json({ message: 'Role deleted successfully' });
        } catch (error) {
            logger.error('Error deleting role:', error);
            if (error.message === 'Role not found') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error deleting role' });
        }
    }

    async assignPermissions(req, res) {
        try {
            const { id } = req.params;
            const { permissionIds } = req.body;
            await roleService.assignPermissions(id, permissionIds);
            res.json({ message: 'Permissions assigned successfully' });
        } catch (error) {
            logger.error('Error assigning permissions:', error);
            if (error.message === 'Role not found') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error assigning permissions' });
        }
    }

    async getRolePermissions(req, res) {
        try {
            const { id } = req.params;
            const permissions = await roleService.getRolePermissions(id);
            res.json(permissions);
        } catch (error) {
            logger.error('Error fetching role permissions:', error);
            res.status(500).json({ message: 'Error fetching role permissions' });
        }
    }
}

module.exports = new RoleController(); 