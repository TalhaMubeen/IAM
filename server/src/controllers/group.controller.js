const logger = require('../config/logger.config');
const groupService = require('../services/group.service');

class GroupController {
    async getAllGroups(req, res) {
        try {
            const groups = await groupService.getAllGroups();
            res.json(groups);
        } catch (error) {
            logger.error('Error fetching groups:', error);
            res.status(500).json({ message: 'Error fetching groups' });
        }
    }

    async getGroupById(req, res) {
        try {
            const { id } = req.params;
            const group = await groupService.getGroupById(id);
            
            if (!group) {
                return res.status(404).json({ message: 'Group not found' });
            }
            
            res.json(group);
        } catch (error) {
            logger.error('Error fetching group:', error);
            res.status(500).json({ message: 'Error fetching group' });
        }
    }

    async createGroup(req, res) {
        try {
            const group = await groupService.createGroup(req.body);
            res.status(201).json({
                message: 'Group created successfully',
                group
            });
        } catch (error) {
            logger.error('Error creating group:', error);
            if (error.message === 'Group name already exists') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error creating group' });
        }
    }

    async updateGroup(req, res) {
        try {
            const { id } = req.params;
            const group = await groupService.updateGroup(id, req.body);
            res.json({
                message: 'Group updated successfully',
                group
            });
        } catch (error) {
            logger.error('Error updating group:', error);
            if (error.message === 'Group not found') {
                return res.status(404).json({ message: error.message });
            }
            if (error.message === 'Group name already exists') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error updating group' });
        }
    }

    async deleteGroup(req, res) {
        try {
            const { id } = req.params;
            await groupService.deleteGroup(id);
            res.json({ message: 'Group deleted successfully' });
        } catch (error) {
            logger.error('Error deleting group:', error);
            if (error.message === 'Group not found') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error deleting group' });
        }
    }

    async assignRoles(req, res) {
        try {
            const { id } = req.params;
            const { roleIds } = req.body;
            await groupService.assignRoles(id, roleIds);
            res.json({ message: 'Roles assigned successfully' });
        } catch (error) {
            logger.error('Error assigning roles:', error);
            if (error.message === 'Group not found') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error assigning roles' });
        }
    }

    async getGroupRoles(req, res) {
        try {
            const { id } = req.params;
            const roles = await groupService.getGroupRoles(id);
            res.json(roles);
        } catch (error) {
            logger.error('Error fetching group roles:', error);
            res.status(500).json({ message: 'Error fetching group roles' });
        }
    }
}

module.exports = new GroupController(); 