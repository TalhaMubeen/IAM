import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPermissions } from "../store/slices/authSlice";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { permissions, token } = useSelector((state) => state.auth);
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulationForm, setSimulationForm] = useState({
    module: "",
    action: "",
  });

  useEffect(() => {
    dispatch(fetchPermissions());
  }, [dispatch]);

  const handleSimulationChange = (e) => {
    const { name, value } = e.target;
    setSimulationForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSimulationSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_URL}/auth/simulate-action`,
        simulationForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setSimulationResult(response.data);
    } catch (error) {
      setSimulationResult({
        success: false,
        message: error.response?.data?.message || "Failed to simulate action",
      });
    }
  };

  // No need to transform permissions since they're already in the correct format
  const groupedPermissions = permissions || {};

  return (
    <div className="space-y-6">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Your Permissions
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              List of all permissions you have access to through your group
              memberships.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="space-y-4">
              {Object.entries(groupedPermissions).map(([module, actions]) => (
                <div key={module} className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-900 capitalize">
                    {module}
                  </h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {actions.map((action) => (
                      <span
                        key={action}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Simulate Action
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Test if you have permission to perform a specific action on a
              module.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <form onSubmit={handleSimulationSubmit}>
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="module"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Module
                  </label>
                  <select
                    id="module"
                    name="module"
                    value={simulationForm.module}
                    onChange={handleSimulationChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  >
                    <option value="">Select a module</option>
                    {Object.keys(groupedPermissions).map((module) => (
                      <option key={module} value={module}>
                        {module}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="action"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Action
                  </label>
                  <select
                    id="action"
                    name="action"
                    value={simulationForm.action}
                    onChange={handleSimulationChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  >
                    <option value="">Select an action</option>
                    {simulationForm.module &&
                      groupedPermissions[simulationForm.module]?.map((action) => (
                        <option key={action} value={action}>
                          {action}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Simulate
                </button>
              </div>
            </form>

            {simulationResult && (
              <div
                className={`mt-4 p-4 rounded-md ${
                  simulationResult.success ? "bg-green-50" : "bg-red-50"
                }`}
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    {simulationResult.success ? (
                      <svg
                        className="h-5 w-5 text-green-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 text-red-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <p
                      className={`text-sm font-medium ${
                        simulationResult.success ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      {simulationResult.message}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
