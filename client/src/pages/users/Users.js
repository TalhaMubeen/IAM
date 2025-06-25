import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { groupAPI, userAPI } from '../../services/api.service';
import CRUDTable from '../../components/CRUDTable';
import Modal from '../../components/Modal';

const Users = () => {
    const { checkPermission } = useAuth();
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '', // Changed from 'name' to match schema
    });

    // Permission checks
    const canCreate = checkPermission('user', 'create');
    const canRead = checkPermission('user', 'read');
    const canUpdate = checkPermission('user', 'update');
    const canDelete = checkPermission('user', 'delete');
    const canAssign = checkPermission('group', 'update');

    const columns = [
        { key: 'username', label: 'Username' }, // Changed from 'name' to match schema
        { key: 'email', label: 'Email' },
        {
            key: 'groups',
            label: 'Groups',
            render: (groups) => (
                <div className="flex flex-wrap gap-1">
                    {groups?.map((group) => (
                        <span
                            key={group}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                            {group}
                        </span>
                    ))}
                </div>
            ),
        },
    ];

    const fetchUsers = async () => {
        if (!canRead) {
            setError("You don't have permission to view users");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const response = await userAPI.getAll();
            setUsers(response.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchGroups = async () => {
        if (!canAssign) {
            return;
        }

        try {
            const response = await groupAPI.getAll();
            setGroups(response.data);
        } catch (err) {
            console.error('Failed to fetch groups:', err);
            setError(err.response?.data?.message || 'Failed to fetch groups');
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchGroups();
    }, [canRead, canAssign]);

    const handleAdd = () => {
        if (!canCreate) {
            setError("You don't have permission to create users");
            return;
        }
        setFormData({ email: '', password: '', username: '' });
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleEdit = (user) => {
        if (!canUpdate) {
            setError("You don't have permission to update users");
            return;
        }
        setFormData({
            email: user.email,
            username: user.username,
            password: '',
        });
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = async (user) => {
        if (!canDelete) {
            setError("You don't have permission to delete users");
            return;
        }

        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await userAPI.delete(user.id);
                setUsers(users.filter(u => u.id !== user.id));
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    const handleAssign = (user) => {
        if (!canAssign) {
            setError("You don't have permission to assign users to groups");
            return;
        }
        setSelectedUser(user);
        setIsAssignModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedUser) {
                if (!canUpdate) {
                    setError("You don't have permission to update users");
                    return;
                }
                await userAPI.update(selectedUser.id, formData);
            } else {
                if (!canCreate) {
                    setError("You don't have permission to create users");
                    return;
                }
                await userAPI.create(formData);
            }
            setIsModalOpen(false);
            fetchUsers();
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save user');
        }
    };

    const handleGroupAssignment = async (groupId) => {
        if (!canAssign) {
            setError("You don't have permission to assign users to groups");
            return;
        }

        try {
            await userAPI.assignToGroup(groupId, selectedUser.id);
            setIsAssignModalOpen(false);
            fetchUsers();
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to assign user to group');
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
                title="Users"
                module='user'
                data={users}
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
                title={selectedUser ? 'Edit User' : 'Add User'}
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
                            {selectedUser ? 'Update' : 'Create'}
                        </button>
                    </div>
                }
            >
                <form className="space-y-4">
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Password {selectedUser && '(leave blank to keep current)'}
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required={!selectedUser}
                        />
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                title="Assign to Group"
                footer={
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={() => setIsAssignModalOpen(false)}
                        >
                            Cancel
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    {groups.map((group) => (
                        <button
                            key={group.id}
                            onClick={() => handleGroupAssignment(group.id)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md"
                        >
                            {group.name}
                        </button>
                    ))}
                </div>
            </Modal>
        </div>
    );
};

export default Users;