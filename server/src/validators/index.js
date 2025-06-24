const authValidators = require('./auth.validator');
const userValidators = require('./user.validator');
const groupValidators = require('./group.validator');
const roleValidators = require('./role.validator');
const moduleValidators = require('./module.validator');
const permissionValidators = require('./permission.validator');

module.exports = {
    ...authValidators,
    ...userValidators,
    ...groupValidators,
    ...roleValidators,
    ...moduleValidators,
    ...permissionValidators
};
