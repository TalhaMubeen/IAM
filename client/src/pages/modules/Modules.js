import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { moduleAPI } from '../../services/api.service';
import CRUDTable from '../../components/CRUDTable';
import Modal from '../../components/Modal';

const Modules = () => {
    const { checkPermission } = useAuth();
    const [modules, setModules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedModule, setSelectedModule] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    // Permission checks
    const canCreate = checkPermission('module', 'create');
    const canRead = checkPermission('module', 'read');
    const canUpdate = checkPermission('module', 'update');
    const canDelete = checkPermission('module', 'delete');

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
                            key={`${permission}-${index}`}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                        >
                            {permission}
                        </span>
                    ))}
                </div>
            ),
        },
    ];

    const fetchModules = async () => {
        if (!canRead) {
            setError("You don't have permission to view modules");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const response = await moduleAPI.getAll();
            setModules(response.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch modules');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchModules();
    }, [canRead]);

    const handleAdd = () => {
        if (!canCreate) {
            setError("You don't have permission to create modules");
            return;
        }
        setFormData({ name: '', description: '' });
        setSelectedModule(null);
        setIsModalOpen(true);
    };

    const handleEdit = (module) => {
        if (!canUpdate) {
            setError("You don't have permission to update modules");
            return;
        }
        setFormData({
            name: module.name,
            description: module.description,
        });
        setSelectedModule(module);
        setIsModalOpen(true);
    };

    const handleDelete = async (module) => {
        if (!canDelete) {
            setError("You don't have permission to delete modules");
            return;
        }

        if (window.confirm('Are you sure you want to delete this module?')) {
            try {
                await moduleAPI.delete(module.id);
                setModules(modules.filter(m => m.id !== module.id));
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete module');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canCreate && !selectedModule) {
            setError("You don't have permission to create modules");
            return;
        }
        if (!canUpdate && selectedModule) {
            setError("You don't have permission to update modules");
            return;
        }
        try {
            if (selectedModule) {
                await moduleAPI.update(selectedModule.id, formData);
            } else {
                await moduleAPI.create(formData);
            }
            setIsModalOpen(false);
            fetchModules();
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save module');
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
                title="Modules"
                module="module"
                data={modules}
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
                title={selectedModule ? 'Edit Module' : 'Add Module'}
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
                            {selectedModule ? 'Update' : 'Create'}
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
        </div>
    );
};

export default Modules;