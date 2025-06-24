import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import CRUDTable from "../components/CRUDTable";
import Modal from "../components/Modal";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

const Users = () => {
  const dispatch = useDispatch();
  const { token, permissions } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  // Permission checks
  const canCreate = permissions?.user?.includes('create');
  const canRead = permissions?.user?.includes('read');
  const canUpdate = permissions?.user?.includes('update');
  const canDelete = permissions?.user?.includes('delete');
  const canAssign = permissions?.group?.includes('update');

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    {
      key: "groups",
      label: "Groups",
      render: (groups) => (
        <div className="flex flex-wrap gap-1">
          {groups?.map((group) => (
            <span
              key={group.id}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
            >
              {group.name}
            </span>
          ))}
        </div>
      ),
    },
  ];

  const fetchUsers = async () => {
    if (!canRead) {
      setError("You don't have permission to view users");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroups = async () => {
    if (!canAssign) {
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(response.data);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, [token, canRead, canAssign]);

  const handleAdd = () => {
    if (!canCreate) {
      setError("You don't have permission to create users");
      return;
    }
    setFormData({ email: "", password: "", name: "" });
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
      name: user.name,
      password: "",
    });
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (user) => {
    if (!canDelete) {
      setError("You don't have permission to delete users");
      return;
    }

    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${API_URL}/users/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchUsers();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete user");
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
        await axios.put(`${API_URL}/users/${selectedUser.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        if (!canCreate) {
          setError("You don't have permission to create users");
          return;
        }
        await axios.post(`${API_URL}/users`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save user");
    }
  };

  const handleGroupAssignment = async (groupId) => {
    if (!canAssign) {
      setError("You don't have permission to assign users to groups");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/groups/${groupId}/users`,
        { userId: selectedUser.id },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setIsAssignModalOpen(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign user to group");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <CRUDTable
        title="Users"
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
          assign: canAssign
        }}
        isLoading={isLoading}
        error={error}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedUser ? "Edit User" : "Add User"}
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
              {selectedUser ? "Update" : "Create"}
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
              Password {selectedUser && "(leave blank to keep current)"}
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
