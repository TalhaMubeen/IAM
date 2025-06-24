-- Clear existing data to ensure clean state
DELETE FROM user_groups;
DELETE FROM group_roles;
DELETE FROM role_permissions;
DELETE FROM permissions;
DELETE FROM roles;
DELETE FROM groups;
DELETE FROM modules;
DELETE FROM users;

-- Create admin user
INSERT INTO users (username, password, email) VALUES 
('admin', '$2b$10$X7UrH5YxX5YxX5YxX5YxX.5YxX5YxX5YxX5YxX5YxX5YxX5YxX', 'admin@admin.com');

-- Create initial modules
INSERT INTO modules (name, description) VALUES 
('Users', 'User management module'),
('Groups', 'Group management module'),
('Roles', 'Role management module'),
('Modules', 'Module management module'),
('Permissions', 'Permission management module');

-- Create initial permissions for each module
INSERT INTO permissions (module_id, action) VALUES 
(1, 'create'), (1, 'read'), (1, 'update'), (1, 'delete'),  -- Users
(2, 'create'), (2, 'read'), (2, 'update'), (2, 'delete'),  -- Groups
(3, 'create'), (3, 'read'), (3, 'update'), (3, 'delete'),  -- Roles
(4, 'create'), (4, 'read'), (4, 'update'), (4, 'delete'),  -- Modules
(5, 'create'), (5, 'read'), (5, 'update'), (5, 'delete');  -- Permissions

-- Create admin role
INSERT INTO roles (name, description) VALUES 
('Admin', 'Administrator role with full access');

-- Assign all permissions to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- Create admin group
INSERT INTO groups (name, description) VALUES 
('Administrators', 'System administrators group');

-- Assign admin role to admin group
INSERT INTO group_roles (group_id, role_id) VALUES (1, 1);

-- Assign admin user to admin group
INSERT INTO user_groups (user_id, group_id) VALUES (1, 1);

-- Verify the setup with detailed queries
SELECT 'Verifying admin user setup...' as message;

-- Verify admin user exists
SELECT * FROM users WHERE email = 'admin@admin.com';

-- Verify user-group relationship
SELECT g.* FROM groups g
JOIN user_groups ug ON g.id = ug.group_id
WHERE ug.user_id = 1;

-- Verify group-role relationship
SELECT r.* FROM roles r
JOIN group_roles gr ON r.id = gr.role_id
WHERE gr.group_id = 1;

-- Verify role-permission relationships
SELECT m.name as module, p.action
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
JOIN modules m ON p.module_id = m.id
WHERE rp.role_id = 1;

-- Verify the actual permission check query
SELECT p.action 
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
JOIN group_roles gr ON rp.role_id = gr.role_id
JOIN user_groups ug ON gr.group_id = ug.group_id
JOIN modules m ON p.module_id = m.id
WHERE ug.user_id = 1 
AND m.name = 'permissions' 
AND p.action = 'read';

-- Verify all relationships in one query
SELECT 
    u.email as user_email,
    g.name as group_name,
    r.name as role_name,
    m.name as module_name,
    p.action as permission_action
FROM users u
JOIN user_groups ug ON u.id = ug.user_id
JOIN groups g ON ug.group_id = g.id
JOIN group_roles gr ON g.id = gr.group_id
JOIN roles r ON gr.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
JOIN modules m ON p.module_id = m.id
WHERE u.email = 'admin@admin.com';