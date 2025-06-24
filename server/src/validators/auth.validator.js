const Joi = require('joi');

const registerSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(6).required(),
    email: Joi.string().email().required()
});

const loginSchema = Joi.object({
    username: Joi.string().min(3).max(30),
    email: Joi.string().email(),
    password: Joi.string().required()
}).xor('username', 'email').messages({
    'object.xor': 'Please provide either username or email',
    'any.required': '{{#label}} is required'
});

module.exports = {
    registerSchema,
    loginSchema
}; 