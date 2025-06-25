const Joi = require('joi');

const createUserSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(6).required(),
    email: Joi.string().email().required()
});

const updateUserSchema = Joi.object({
    username: Joi.string().min(3).max(30),
    email: Joi.string().email(),
    password: Joi.string().min(6)
}).min(1); // At least one field must be provided

const assignGroupsSchema = Joi.object({
    groupId: Joi.array().items(Joi.number().integer().positive()).required()
});

module.exports = {
    createUserSchema,
    updateUserSchema,
    assignGroupsSchema
}; 