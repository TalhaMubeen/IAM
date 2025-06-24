const Joi = require('joi');

const groupSchema = {
    create: Joi.object({
        name: Joi.string().min(3).max(50).required(),
        description: Joi.string().max(200)
    }),

    update: Joi.object({
        name: Joi.string().min(3).max(50),
        description: Joi.string().max(200)
    }),

    assignUsers: Joi.object({
        userIds: Joi.array().items(Joi.number().integer()).required()
    }),

    assignRoles: Joi.object({
        roleIds: Joi.array().items(Joi.number().integer()).required()
    })
};

module.exports = groupSchema; 