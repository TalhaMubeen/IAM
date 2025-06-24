const jwt = require('jsonwebtoken');
const { db } = require('../config/db.config');
const logger = require('../config/logger.config');

const verifyToken = (req, res, next) => {
    logger.info('Verifying token for request:', {
        path: req.path,
        method: req.method,
        headers: req.headers
    });

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        logger.warn('No token provided in request');
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        logger.info('Token verified successfully:', {
            userId: decoded.id,
            username: decoded.username
        });
        req.user = decoded;
        next();
    } catch (error) {
        logger.error('Token verification failed:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// const checkPermission = (module, action) => {
//     return async (req, res, next) => {
//         try {
//             const userId = req.user.id;
//             // Get user's permissions through group memberships
//             const query = `
//                 SELECT DISTINCT p.action
//                 FROM permissions p
//                 JOIN role_permissions rp ON p.id = rp.permission_id
//                 JOIN roles r ON rp.role_id = r.id
//                 JOIN group_roles gr ON r.id = gr.role_id
//                 JOIN user_groups ug ON gr.group_id = ug.group_id
//                 JOIN modules m ON p.module_id = m.id
//                 WHERE ug.user_id = ? AND m.name = ?
//             `;

//             db.all(query, [userId, module], (err, permissions) => {
//                 if (err) {
//                     logger.error('Error checking permissions:', err);
//                     return res.status(500).json({ message: 'Error checking permissions' });
//                 }

//                 const hasPermission = permissions.some(p => p.action === action);
//                 if (!hasPermission) {
//                     return res.status(403).json({ message: 'Insufficient permissions' });
//                 }

//                 next();
//             });
//         } catch (error) {
//             logger.error('Permission check failed:', error);
//             return res.status(500).json({ message: 'Error checking permissions' });
//         }
//     };
// };

module.exports = {
    verifyToken
};