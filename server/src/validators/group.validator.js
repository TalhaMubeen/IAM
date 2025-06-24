const Joi = require('joi');

const createGroupSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    description: Joi.string().max(200)
});

const updateGroupSchema = Joi.object({
    name: Joi.string().min(3).max(50),
    description: Joi.string().max(200)
}).min(1); // At least one field must be provided

const assignRolesSchema = Joi.object({
    roleIds: Joi.array().items(Joi.number().integer().positive()).required()
});

module.exports = {
    createGroupSchema,
    updateGroupSchema,
    assignRolesSchema
}; 