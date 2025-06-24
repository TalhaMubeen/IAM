const Joi = require('joi');

const roleSchema = {
    create: Joi.object({
        name: Joi.string().min(3).max(50).required(),
        description: Joi.string().max(200)
    }),

    update: Joi.object({
        name: Joi.string().min(3).max(50),
        description: Joi.string().max(200)
    }),

    assignPermissions: Joi.object({
        permissionIds: Joi.array().items(Joi.number().integer()).required()
    })
};

module.exports = roleSchema; 