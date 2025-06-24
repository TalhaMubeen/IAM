import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import CRUDTable from "../components/CRUDTable";
import Modal from "../components/Modal";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

const Permissions = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [permissions, setPermissions] = useState([]);
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [formData, setFormData] = useState({
    moduleId: "",
    action: "",
  });

  const columns = [
    {
      key: "module",
      label: "Module",
      render: (module) => module?.name || "N/A",
    },
    { key: "action", label: "Action" },
  ];

  const actions = ["create", "read", "update", "delete"];

  const fetchPermissions = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPermissions(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch permissions");
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
    fetchPermissions();
    fetchModules();
  }, [token]);

  const handleAdd = () => {
    setFormData({ moduleId: "", action: "" });
    setSelectedPermission(null);
    setIsModalOpen(true);
  };

  const handleEdit = (permission) => {
    setFormData({
      moduleId: permission.module.id,
      action: permission.action,
    });
    setSelectedPermission(permission);
    setIsModalOpen(true);
  };

  const handleDelete = async (permission) => {
    if (window.confirm("Are you sure you want to delete this permission?")) {
      try {
        await axios.delete(`${API_URL}/permissions/${permission.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchPermissions();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete permission");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedPermission) {
        await axios.put(
          `${API_URL}/permissions/${selectedPermission.id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      } else {
        await axios.post(`${API_URL}/permissions`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setIsModalOpen(false);
      fetchPermissions();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save permission");
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
        title="Permissions"
        data={permissions}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        permissions={["create", "read", "update", "delete"]}
        isLoading={isLoading}
        error={error}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPermission ? "Edit Permission" : "Add Permission"}
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
              {selectedPermission ? "Update" : "Create"}
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
