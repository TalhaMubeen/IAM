const Joi = require('joi');

const userSchema = {
    create: Joi.object({
        username: Joi.string().min(3).max(30).required(),
        password: Joi.string().min(6).required(),
        email: Joi.string().email().required()
    }),

    update: Joi.object({
        username: Joi.string().min(3).max(30),
        email: Joi.string().email(),
        password: Joi.string().min(6)
    }),

    login: Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
    })
};

module.exports = userSchema; 