const Joi = require('joi');

const createRoleSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    description: Joi.string().max(200)
});

const updateRoleSchema = Joi.object({
    name: Joi.string().min(3).max(50),
    description: Joi.string().max(200)
}).min(1); // At least one field must be provided

const assignPermissionsSchema = Joi.object({
    permissionIds: Joi.array().items(Joi.number().integer().positive()).required()
});

module.exports = {
    createRoleSchema,
    updateRoleSchema,
    assignPermissionsSchema
}; 