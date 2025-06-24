import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import CRUDTable from "../components/CRUDTable";
import Modal from "../components/Modal";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

const Groups = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [groups, setGroups] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const columns = [
    { key: "name", label: "Name" },
    { key: "description", label: "Description" },
    {
      key: "roles",
      label: "Roles",
      render: (roles) => (
        <div className="flex flex-wrap gap-1">
          {roles?.map((role) => (
            <span
              key={role.id}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
            >
              {role.name}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "users",
      label: "Users",
      render: (users) => (
        <div className="flex flex-wrap gap-1">
          {users?.map((user) => (
            <span
              key={user.id}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {user.name}
            </span>
          ))}
        </div>
      ),
    },
  ];

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch groups");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${API_URL}/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoles(response.data);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchRoles();
  }, [token]);

  const handleAdd = () => {
    setFormData({ name: "", description: "" });
    setSelectedGroup(null);
    setIsModalOpen(true);
  };

  const handleEdit = (group) => {
    setFormData({
      name: group.name,
      description: group.description,
    });
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  const handleDelete = async (group) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      try {
        await axios.delete(`${API_URL}/groups/${group.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchGroups();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete group");
      }
    }
  };

  const handleAssign = (group) => {
    setSelectedGroup(group);
    setIsAssignModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedGroup) {
        await axios.put(`${API_URL}/groups/${selectedGroup.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/groups`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setIsModalOpen(false);
      fetchGroups();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save group");
    }
  };

  const handleRoleAssignment = async (roleId) => {
    try {
      await axios.post(
        `${API_URL}/groups/${selectedGroup.id}/roles`,
        { roleId },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setIsAssignModalOpen(false);
      fetchGroups();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign role to group");
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
        title="Groups"
        data={groups}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAssign={handleAssign}
        permissions={["create", "read", "update", "delete"]}
        isLoading={isLoading}
        error={error}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedGroup ? "Edit Group" : "Add Group"}
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
              {selectedGroup ? "Update" : "Create"}
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
