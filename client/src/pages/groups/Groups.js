import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { groupAPI, roleAPI } from '../../services/api.service';
import CRUDTable from '../../components/CRUDTable';
import Modal from '../../components/Modal';

const Groups = () => {
    const { checkPermission } = useAuth();
    const [groups, setGroups] = useState([]);
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    // Permission checks
    const canCreate = checkPermission('group', 'create');
    const canRead = checkPermission('group', 'read');
    const canUpdate = checkPermission('group', 'update');
    const canDelete = checkPermission('group', 'delete');
    const canAssign = checkPermission('group', 'update'); // Role assignment requires group update permission

    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'description', label: 'Description' },
        {
            key: 'roles',
            label: 'Roles',
            render: (roles) => (
                <div className="flex flex-wrap gap-1">
                    {roles?.map((role) => (
                        <span
                            key={role}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                            {role}
                        </span>
                    ))}
                </div>
            ),
        },
        {
            key: 'users',
            label: 'Users',
            render: (users) => (
                <div className="flex flex-wrap gap-1">
                    {users?.map((user) => (
                        <span
                            key={user}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                            {user}
                        </span>
                    ))}
                </div>
            ),
        },
    ];

    const fetchGroups = async () => {
        if (!canRead) {
            setError("You don't have permission to view groups");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const response = await groupAPI.getAll();
            setGroups(response.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch groups');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRoles = async () => {
        if (!canAssign) {
            return;
        }

        try {
            const response = await roleAPI.getAll(); // Assumes roleAPI.getAll exists
            setRoles(response.data);
        } catch (err) {
            console.error('Failed to fetch roles:', err);
            setError(err.response?.data?.message || 'Failed to fetch roles');
        }
    };

    useEffect(() => {
        fetchGroups();
        fetchRoles();
    }, [canRead, canAssign]);

    const handleAdd = () => {
        if (!canCreate) {
            setError("You don't have permission to create groups");
            return;
        }
        setFormData({ name: '', description: '' });
        setSelectedGroup(null);
        setIsModalOpen(true);
    };

    const handleEdit = (group) => {
        if (!canUpdate) {
            setError("You don't have permission to update groups");
            return;
        }
        setFormData({
            name: group.name,
            description: group.description,
        });
        setSelectedGroup(group);
        setIsModalOpen(true);
    };

    const handleDelete = async (group) => {
        if (!canDelete) {
            setError("You don't have permission to delete groups");
            return;
        }

        if (window.confirm('Are you sure you want to delete this group?')) {
            try {
                await groupAPI.delete(group.id);
                setGroups(groups.filter(g => g.id !== group.id));
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete group');
            }
        }
    };

    const handleAssign = (group) => {
        if (!canAssign) {
            setError("You don't have permission to assign roles to groups");
            return;
        }
        setSelectedGroup(group);
        setIsAssignModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canCreate && !selectedGroup) {
            setError("You don't have permission to create groups");
            return;
        }
        if (!canUpdate && selectedGroup) {
            setError("You don't have permission to update groups");
            return;
        }
        try {
            if (selectedGroup) {
                await groupAPI.update(selectedGroup.id, formData);
            } else {
                await groupAPI.create(formData);
            }
            setIsModalOpen(false);
            fetchGroups();
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save group');
        }
    };

    const handleRoleAssignment = async (roleId) => {
        if (!canAssign) {
            setError("You don't have permission to assign roles to groups");
            return;
        }
        try {
            await groupAPI.assignRole(selectedGroup.id, roleId);
            setIsAssignModalOpen(false);
            fetchGroups();
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to assign role to group');
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
                title="Groups"
                module="group"
                data={groups}
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
                title={selectedGroup ? 'Edit Group' : 'Add Group'}
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
                            {selectedGroup ? 'Update' : 'Create'}
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
                title="Assign Role"
                footer={
                    <div className="flex justify-end space-x-3">
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
                        Select a role to assign to {selectedGroup?.name}:
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        {roles.map((role) => (
                            <button
                                key={role.id}
                                onClick={() => handleRoleAssignment(role.id)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {role.name}
                            </button>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Groups;