import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { roleAPI, moduleAPI } from '../../services/api.service';
import CRUDTable from '../../components/CRUDTable';
import Modal from '../../components/Modal';

const Roles = () => {
    const { checkPermission } = useAuth();
    const [roles, setRoles] = useState([]);
    const [modules, setModules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    // Permission checks
    const canCreate = checkPermission('role', 'create');
    const canRead = checkPermission('role', 'read');
    const canUpdate = checkPermission('role', 'update');
    const canDelete = checkPermission('role', 'delete');
    const canAssign = checkPermission('role', 'update'); // Permission assignment requires role update permission

    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'description', label: 'Description' },
        {
            key: 'permissions',
            label: 'Permissions',
            render: (permissions) => (
                <div className="flex flex-wrap gap-1">
                    {permissions?.map((permission, index) => (
                        <span
                            key={`${permission.module}-${permission.action}-${index}`}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                        >
                            {permission.module} - {permission.action}
                        </span>
                    ))}
                </div>
            ),
        },
    ];

    const fetchRoles = async () => {
        if (!canRead) {
            setError("You don't have permission to view roles");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const response = await roleAPI.getAll();
            setRoles(response.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch roles');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchModules = async () => {
        if (!canAssign) {
            return;
        }

        try {
            const response = await moduleAPI.getAll(); // Assumes moduleAPI.getAll exists
            setModules(response.data);
        } catch (err) {
            console.error('Failed to fetch modules:', err);
            setError(err.response?.data?.message || 'Failed to fetch modules');
        }
    };

    useEffect(() => {
        fetchRoles();
        fetchModules();
    }, [canRead, canAssign]);

    const handleAdd = () => {
        if (!canCreate) {
            setError("You don't have permission to create roles");
            return;
        }
        setFormData({ name: '', description: '' });
        setSelectedRole(null);
        setIsModalOpen(true);
    };

    const handleEdit = (role) => {
        if (!canUpdate) {
            setError("You don't have permission to update roles");
            return;
        }
        setFormData({
            name: role.name,
            description: role.description,
        });
        setSelectedRole(role);
        setIsModalOpen(true);
    };

    const handleDelete = async (role) => {
        if (!canDelete) {
            setError("You don't have permission to delete roles");
            return;
        }

        if (window.confirm('Are you sure you want to delete this role?')) {
            try {
                await roleAPI.delete(role.id);
                setRoles(roles.filter(r => r.id !== role.id));
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete role');
            }
        }
    };

    const handleAssign = (role) => {
        if (!canAssign) {
            setError("You don't have permission to assign permissions to roles");
            return;
        }
        setSelectedRole(role);
        setIsAssignModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canCreate && !selectedRole) {
            setError("You don't have permission to create roles");
            return;
        }
        if (!canUpdate && selectedRole) {
            setError("You don't have permission to update roles");
            return;
        }
        try {
            if (selectedRole) {
                await roleAPI.update(selectedRole.id, formData);
            } else {
                await roleAPI.create(formData);
            }
            setIsModalOpen(false);
            fetchRoles();
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save role');
        }
    };

    const handlePermissionAssignment = async (moduleId, action) => {
        if (!canAssign) {
            setError("You don't have permission to assign permissions to roles");
            return;
        }
        try {
            await roleAPI.assignPermission(selectedRole.id, moduleId, action);
            setIsAssignModalOpen(false);
            fetchRoles();
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to assign permission to role');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const actions = ['create', 'read', 'update', 'delete'];

    if (isLoading) return <div className="flex justify-center items-center h-64">Loading...</div>;
    if (error) return (
        <div className="flex justify-center items-center h-64">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <CRUDTable
                title="Roles"
                module="role"
                data={roles}
                columns={columns}
                onAdd={canCreate ? handleAdd : null}
                onEdit={canUpdate ? handleEdit : null}
                onDelete={canDelete ? handleDelete : null}
                onAssign={canAssign ? handleAssign : null}
                permissions={{
                    create: canCreate,
                    read: canRead,
                    update: canUpdate,
                    delete: canDelete,
                    assign: canAssign,
                }}
                isLoading={isLoading}
                error={error}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedRole ? 'Edit Role' : 'Add Role'}
                footer={
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={handleSubmit}
                        >
                            {selectedRole ? 'Update' : 'Create'}
                        </button>
                    </div>
                }
            >
                <form className="space-y-4">
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Description
                        </label>
                        <textarea
                            name="description"
                            id="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                title="Assign Permissions"
                size="lg"
                footer={
                    <div className="flex justify-end">
                        <button
                            type="button"
                            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={() => setIsAssignModalOpen(false)}
                        >
                            Close
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                        Select permissions to assign to {selectedRole?.name}:
                    </p>
                    <div className="grid grid-cols-1 gap-4">
                        {modules.map((module) => (
                            <div key={module.id} className="border rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">
                                    {module.name}
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {actions.map((action) => (
                                        <button
                                            key={`${module.id}-${action}`}
                                            onClick={() => handlePermissionAssignment(module.id, action)}
                                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            {action}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Roles;