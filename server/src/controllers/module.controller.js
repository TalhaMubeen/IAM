const logger = require('../config/logger.config');
const moduleService = require('../services/module.service');

class ModuleController {
    async getAllModules(req, res) {
        try {
            const modules = await moduleService.getAllModules();
            res.json(modules);
        } catch (error) {
            logger.error('Error fetching modules:', error);
            res.status(500).json({ message: 'Error fetching modules' });
        }
    }

    async getModuleById(req, res) {
        try {
            const { id } = req.params;
            const module = await moduleService.getModuleById(id);
            
            if (!module) {
                return res.status(404).json({ message: 'Module not found' });
            }
            
            res.json(module);
        } catch (error) {
            logger.error('Error fetching module:', error);
            res.status(500).json({ message: 'Error fetching module' });
        }
    }

    async createModule(req, res) {
        try {
            const module = await moduleService.createModule(req.body);
            res.status(201).json({
                message: 'Module created successfully',
                module
            });
        } catch (error) {
            logger.error('Error creating module:', error);
            if (error.message === 'Module name already exists') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error creating module' });
        }
    }

    async updateModule(req, res) {
        try {
            const { id } = req.params;
            const module = await moduleService.updateModule(id, req.body);
            res.json({
                message: 'Module updated successfully',
                module
            });
        } catch (error) {
            logger.error('Error updating module:', error);
            if (error.message === 'Module not found') {
                return res.status(404).json({ message: error.message });
            }
            if (error.message === 'Module name already exists') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error updating module' });
        }
    }

    async deleteModule(req, res) {
        try {
            const { id } = req.params;
            await moduleService.deleteModule(id);
            res.json({ message: 'Module deleted successfully' });
        } catch (error) {
            logger.error('Error deleting module:', error);
            if (error.message === 'Module not found') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error deleting module' });
        }
    }

    async getModulePermissions(req, res) {
        try {
            const { id } = req.params;
            const permissions = await moduleService.getModulePermissions(id);
            res.json(permissions);
        } catch (error) {
            logger.error('Error fetching module permissions:', error);
            res.status(500).json({ message: 'Error fetching module permissions' });
        }
    }
}

module.exports = new ModuleController(); 