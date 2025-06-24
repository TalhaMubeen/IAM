const { authMiddleware } = require('./auth.middleware');
const { errorMiddleware } = require('./error.middleware');
const { validateSchema } = require('./validation.middleware');

module.exports = {
    authMiddleware,
    errorMiddleware,
    validateSchema
}; 