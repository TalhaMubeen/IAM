const Joi = require('joi');

const createPermissionSchema = Joi.object({
    moduleId: Joi.number().integer().positive().required(),
    action: Joi.string().valid('create', 'read', 'update', 'delete').required()
});

const updatePermissionSchema = Joi.object({
    moduleId: Joi.number().integer().positive(),
    action: Joi.string().valid('create', 'read', 'update', 'delete')
}).min(1); // At least one field must be provided

module.exports = {
    createPermissionSchema,
    updatePermissionSchema
}; 