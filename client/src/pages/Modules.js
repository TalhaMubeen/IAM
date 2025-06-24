import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import CRUDTable from "../components/CRUDTable";
import Modal from "../components/Modal";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

const Modules = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const columns = [
    { key: "name", label: "Name" },
    { key: "description", label: "Description" },
  ];

  const fetchModules = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/modules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModules(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch modules");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [token]);

  const handleAdd = () => {
    setFormData({ name: "", description: "" });
    setSelectedModule(null);
    setIsModalOpen(true);
  };

  const handleEdit = (module) => {
    setFormData({
      name: module.name,
      description: module.description,
    });
    setSelectedModule(module);
    setIsModalOpen(true);
  };

  const handleDelete = async (module) => {
    if (window.confirm("Are you sure you want to delete this module?")) {
      try {
        await axios.delete(`${API_URL}/modules/${module.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchModules();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete module");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedModule) {
        await axios.put(`${API_URL}/modules/${selectedModule.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/modules`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setIsModalOpen(false);
      fetchModules();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save module");
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
        title="Modules"
        data={modules}
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
        title={selectedModule ? "Edit Module" : "Add Module"}
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
              {selectedModule ? "Update" : "Create"}
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
