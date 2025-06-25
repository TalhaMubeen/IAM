const logger = require('../config/logger.config');
const userService = require('../services/user.service');

class UserController {
    async getAllUsers(req, res) {
        try {
            logger.info('Fetching all users');
            const users = await userService.getAllUsers();
            logger.info('Users fetched successfully:', { count: users.length });
            res.json(users);
        } catch (error) {
            logger.error('Error fetching users:', error);
            res.status(500).json({ message: 'Error fetching users' });
        }
    }

    async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await userService.getUserById(id);
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            res.json(user);
        } catch (error) {
            logger.error('Error fetching user:', error);
            res.status(500).json({ message: 'Error fetching user' });
        }
    }

    async createUser(req, res) {
        try {
            const user = await userService.createUser(req.body);
            res.status(201).json({
                message: 'User created successfully',
                user
            });
        } catch (error) {
            logger.error('Error creating user:', error);
            if (error.message === 'Username or email already exists') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error creating user' });
        }
    }

    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const user = await userService.updateUser(id, req.body);
            res.json({
                message: 'User updated successfully',
                user
            });
        } catch (error) {
            logger.error('Error updating user:', error);
            if (error.message === 'User not found') {
                return res.status(404).json({ message: error.message });
            }
            if (error.message === 'Username or email already exists') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error updating user' });
        }
    }

    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            await userService.deleteUser(id);
            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            logger.error('Error deleting user:', error);
            if (error.message === 'User not found') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error deleting user' });
        }
    }

    async assignGroups(req, res) {
        try {
            const { id } = req.params;
            const { groupId } = req.body;
            await userService.assignGroup(id, groupId);
            res.json({ message: 'Groups assigned successfully' });
        } catch (error) {
            logger.error('Error assigning groups:', error);
            if (error.message === 'User not found') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error assigning groups' });
        }
    }
}

module.exports = new UserController(); 