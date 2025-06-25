-- Insert test users (password is 'password123' hashed with bcrypt)
INSERT INTO users (username, password, email) VALUES
('admin', '$2a$12$EHcpKQTtgO3uE03AjoUSNePp36HWZ5jLT3D0Ke7avFPWWB.YrfL5C', 'admin@mid.com'), --password Admin@123
('manager', '$2a$12$EHcpKQTtgO3uE03AjoUSNePp36HWZ5jLT3D0Ke7avFPWWB.YrfL5C', 'manager@mid.com'), --password Admin@123
('user', '$2a$12$EHcpKQTtgO3uE03AjoUSNePp36HWZ5jLT3D0Ke7avFPWWB.YrfL5C', 'user@mid.com'); --password Admin@123

-- Insert groups
INSERT INTO groups (name, description) VALUES
('Administrators', 'System administrators with full access'),
('Managers', 'Department managers with elevated access'),
('Users', 'Regular users with basic access');

-- Insert roles
INSERT INTO roles (name, description) VALUES
('Super Admin', 'Full system access'),
('Manager', 'Department management access'),
('User', 'Basic user access');

-- Insert modules
INSERT INTO modules (name, description) VALUES
('user', 'User management module'),
('group', 'Group management module'),
('role', 'Role management module'),
('module', 'Module management module'),
('permission', 'Permission management module');

-- Insert permissions for each module
INSERT INTO permissions (module_id, action) VALUES
-- User module permissions
(1, 'create'),
(1, 'read'),
(1, 'update'),
(1, 'delete'),
-- Group module permissions
(2, 'create'),
(2, 'read'),
(2, 'update'),
(2, 'delete'),
-- Role module permissions
(3, 'create'),
(3, 'read'),
(3, 'update'),
(3, 'delete'),
-- Module module permissions
(4, 'create'),
(4, 'read'),
(4, 'update'),
(4, 'delete'),
-- Permission module permissions
(5, 'create'),
(5, 'read'),
(5, 'update'),
(5, 'delete');

-- Assign users to groups
INSERT INTO user_groups (user_id, group_id) VALUES
(1, 1), -- admin -> Administrators
(2, 2), -- manager -> Managers
(3, 3); -- user -> Users

-- Assign roles to groups
INSERT INTO group_roles (group_id, role_id) VALUES
(1, 1), -- Administrators -> Super Admin
(2, 2), -- Managers -> Manager
(3, 3); -- Users -> User

-- Assign permissions to roles
-- Super Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- Manager gets read permissions for all modules and update for users and groups
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions 
WHERE action = 'read' 
   OR (module_id IN (1, 2) AND action = 'update');

-- User gets read permissions for users and groups
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions 
WHERE (module_id IN (1, 2) AND action = 'read'); 