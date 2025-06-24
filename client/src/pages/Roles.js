import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import CRUDTable from "../components/CRUDTable";
import Modal from "../components/Modal";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

const Roles = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const columns = [
    { key: "name", label: "Name" },
    { key: "description", label: "Description" },
    {
      key: "permissions",
      label: "Permissions",
      render: (permissions) => (
        <div className="flex flex-wrap gap-1">
          {permissions?.map((permission) => (
            <span
              key={permission.id}
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
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoles(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch roles");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await axios.get(`${API_URL}/modules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModules(response.data);
    } catch (err) {
      console.error("Failed to fetch modules:", err);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchModules();
  }, [token]);

  const handleAdd = () => {
    setFormData({ name: "", description: "" });
    setSelectedRole(null);
    setIsModalOpen(true);
  };

  const handleEdit = (role) => {
    setFormData({
      name: role.name,
      description: role.description,
    });
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleDelete = async (role) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      try {
        await axios.delete(`${API_URL}/roles/${role.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchRoles();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete role");
      }
    }
  };

  const handleAssign = (role) => {
    setSelectedRole(role);
    setIsAssignModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedRole) {
        await axios.put(`${API_URL}/roles/${selectedRole.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/roles`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setIsModalOpen(false);
      fetchRoles();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save role");
    }
  };

  const handlePermissionAssignment = async (moduleId, action) => {
    try {
      await axios.post(
        `${API_URL}/roles/${selectedRole.id}/permissions`,
        { moduleId, action },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setIsAssignModalOpen(false);
      fetchRoles();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to assign permission to role",
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const actions = ["create", "read", "update", "delete"];

  return (
    <div className="space-y-6">
      <CRUDTable
        title="Roles"
        data={roles}
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
        title={selectedRole ? "Edit Role" : "Add Role"}
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
              {selectedRole ? "Update" : "Create"}
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
                      key={action}
                      onClick={() =>
                        handlePermissionAssignment(module.id, action)
                      }
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
