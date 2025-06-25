import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { permissionAPI, moduleAPI } from '../../services/api.service';
import CRUDTable from '../../components/CRUDTable';
import Modal from '../../components/Modal';
import { useDispatch } from 'react-redux';

const Permissions = () => {
    const dispatch = useDispatch();
    const { checkPermission } = useAuth();
    const [permissions, setPermissions] = useState([]);
    const [modules, setModules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState(null);
    const [formData, setFormData] = useState({
        moduleId: '',
        action: '',
    });

    // Permission checks
    const canCreate = checkPermission('permission', 'create');
    const canRead = checkPermission('permission', 'read');
    const canUpdate = checkPermission('permission', 'update');
    const canDelete = checkPermission('permission', 'delete');

    const columns = [
        {
            key: 'module',
            label: 'Module',
            render: (module) => module?.name || 'N/A',
        },
        { key: 'action', label: 'Action' },
    ];

    const actions = ['create', 'read', 'update', 'delete'];

    useEffect(() => {
        if (!isLoading) {
            dispatch(fetchPermissions());
        }
      }, [dispatch]);

    const fetchPermissions = async () => {
        if (!canRead) {
            setError("You don't have permission to view permissions");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const response = await permissionAPI.getAll();
            setPermissions(response.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch permissions');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchModules = async () => {
        try {
            const response = await moduleAPI.getAll();
            setModules(response.data);
        } catch (err) {
            console.error('Failed to fetch modules:', err);
            setError(err.response?.data?.message || 'Failed to fetch modules');
        }
    };

    useEffect(() => {
        fetchPermissions();
        fetchModules();
    }, [canRead]);

    const handleAdd = () => {
        if (!canCreate) {
            setError("You don't have permission to create permissions");
            return;
        }
        setFormData({ moduleId: '', action: '' });
        setSelectedPermission(null);
        setIsModalOpen(true);
    };

    const handleEdit = (permission) => {
        if (!canUpdate) {
            setError("You don't have permission to update permissions");
            return;
        }
        setFormData({
            moduleId: permission.module?.id || '',
            action: permission.action,
        });
        setSelectedPermission(permission);
        setIsModalOpen(true);
    };

    const handleDelete = async (permission) => {
        if (!canDelete) {
            setError("You don't have permission to delete permissions");
            return;
        }

        if (window.confirm('Are you sure you want to delete this permission?')) {
            try {
                await permissionAPI.delete(permission.id);
                setPermissions(permissions.filter(p => p.id !== permission.id));
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete permission');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canCreate && !selectedPermission) {
            setError("You don't have permission to create permissions");
            return;
        }
        if (!canUpdate && selectedPermission) {
            setError("You don't have permission to update permissions");
            return;
        }
        try {
            if (selectedPermission) {
                await permissionAPI.update(selectedPermission.id, formData);
            } else {
                await permissionAPI.create(formData);
            }
            setIsModalOpen(false);
            fetchPermissions();
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save permission');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

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
                title="Permissions"
                module="permission"
                data={permissions}
                columns={columns}
                onAdd={canCreate ? handleAdd : null}
                onEdit={canUpdate ? handleEdit : null}
                onDelete={canDelete ? handleDelete : null}
                permissions={{
                    create: canCreate,
                    read: canRead,
                    update: canUpdate,
                    delete: canDelete,
                }}
                isLoading={isLoading}
                error={error}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedPermission ? 'Edit Permission' : 'Add Permission'}
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
                            {selectedPermission ? 'Update' : 'Create'}
                        </button>
                    </div>
                }
            >
                <form className="space-y-4">
                    <div>
                        <label
                            htmlFor="moduleId"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Module
                        </label>
                        <select
                            name="moduleId"
                            id="moduleId"
                            value={formData.moduleId}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        >
                            <option value="">Select a module</option>
                            {modules.map((module) => (
                                <option key={module.id} value={module.id}>
                                    {module.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label
                            htmlFor="action"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Action
                        </label>
                        <select
                            name="action"
                            id="action"
                            value={formData.action}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        >
                            <option value="">Select an action</option>
                            {actions.map((action) => (
                                <option key={action} value={action}>
                                    {action}
                                </option>
                            ))}
                        </select>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Permissions;