const Joi = require('joi');

const moduleSchema = {
    create: Joi.object({
        name: Joi.string().min(3).max(50).required(),
        description: Joi.string().max(200)
    }),

    update: Joi.object({
        name: Joi.string().min(3).max(50),
        description: Joi.string().max(200)
    })
};

module.exports = moduleSchema; 