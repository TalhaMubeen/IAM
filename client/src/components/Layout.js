import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";

const Layout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { permissions } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const hasPermission = (module, action) => {
    console.log('Data =>', permissions, module, action);
    if (!permissions || typeof permissions !== 'object') return false;
    return permissions[module]?.includes(action) || true;
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      permission: { module: "dashboard", action: "read" },
    },
    {
      name: "Users",
      path: "/users",
      permission: { module: "users", action: "read" },
    },
    {
      name: "Groups",
      path: "/groups",
      permission: { module: "groups", action: "read" },
    },
    {
      name: "Roles",
      path: "/roles",
      permission: { module: "roles", action: "read" },
    },
    {
      name: "Modules",
      path: "/modules",
      permission: { module: "modules", action: "read" },
    },
    {
      name: "Permissions",
      path: "/permissions",
      permission: { module: "permissions", action: "read" },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">IAM System</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {menuItems.map((item) => {
                  if (hasPermission(item.permission.module, item.permission.action)) {
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      >
                        {item.name}
                      </Link>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
