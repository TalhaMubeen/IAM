const logger = require('../config/logger.config');

const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        // if (error) {
        //     const errorMessage = error.details.map(detail => detail.message).join(', ');
        //     logger.warn('Validation error:', { error: errorMessage, body: req.body });
        //     return res.status(400).json({
        //         error: errorMessage,
        //         body: req.body
        //     });
        // } else {
        next();

    };
};

module.exports = validate; 