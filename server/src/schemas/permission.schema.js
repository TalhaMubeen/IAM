const Joi = require('joi');

const permissionSchema = {
    create: Joi.object({
        module_id: Joi.number().integer().required(),
        action: Joi.string().valid('create', 'read', 'update', 'delete').required()
    }),

    update: Joi.object({
        module_id: Joi.number().integer(),
        action: Joi.string().valid('create', 'read', 'update', 'delete')
    })
};

module.exports = permissionSchema; 