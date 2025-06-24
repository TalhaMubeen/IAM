import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const MainLayout = () => {
  const { user, logout, checkPermission } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', path: '/', permission: null },
    { name: 'Users', path: '/users', permission: 'user:read' },
    { name: 'Groups', path: '/groups', permission: 'group:read' },
    { name: 'Roles', path: '/roles', permission: 'role:read' },
    { name: 'Modules', path: '/modules', permission: 'module:read' },
    { name: 'Permissions', path: '/permissions', permission: 'permission:read' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-indigo-600">IAM System</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  if (item.permission && !checkPermission(...item.permission.split(':'))) {
                    return null;
                  }
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`${
                        location.pathname === item.path
                          ? 'border-indigo-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="ml-3 relative">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">{user?.username}</span>
                  <button
                    onClick={logout}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout; 