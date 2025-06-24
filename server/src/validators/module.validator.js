const Joi = require('joi');

const createModuleSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    description: Joi.string().max(200)
});

const updateModuleSchema = Joi.object({
    name: Joi.string().min(3).max(50),
    description: Joi.string().max(200)
}).min(1); // At least one field must be provided

module.exports = {
    createModuleSchema,
    updateModuleSchema
}; 