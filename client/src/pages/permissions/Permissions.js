import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api.service';

const Permissions = () => {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { checkPermission } = useAuth();

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        try {
            const response = await api.permissions.getAll();
            setPermissions(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch permissions');
            setLoading(false);
        }
    };

    const handleDelete = async (permissionId) => {
        if (!window.confirm('Are you sure you want to delete this permission?')) return;
        
        try {
            await api.permissions.delete(permissionId);
            setPermissions(permissions.filter(permission => permission.id !== permissionId));
        } catch (err) {
            setError('Failed to delete permission');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-xl font-semibold text-gray-900">Permissions</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        A list of all permissions in the system including their name, description, and associated module.
                    </p>
                </div>
                {checkPermission('permissions:create') && (
                    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                        >
                            Add permission
                        </button>
                    </div>
                )}
            </div>
            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                            Name
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Description
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Module
                                        </th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {permissions.map((permission) => (
                                        <tr key={permission.id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                {permission.name}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {permission.description}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {permission.module?.name}
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                {checkPermission('permissions:update') && (
                                                    <button
                                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                                {checkPermission('permissions:delete') && (
                                                    <button
                                                        onClick={() => handleDelete(permission.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Permissions; 