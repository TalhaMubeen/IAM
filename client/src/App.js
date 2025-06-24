import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './layouts/MainLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Users from './pages/users/Users';
import Groups from './pages/groups/Groups';
import Roles from './pages/roles/Roles';
import Modules from './pages/modules/Modules';
import Permissions from './pages/permissions/Permissions';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        
        <Route
          path="users"
          element={
            <ProtectedRoute requiredPermission="user:read">
              <Users />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="groups"
          element={
            <ProtectedRoute requiredPermission="group:read">
              <Groups />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="roles"
          element={
            <ProtectedRoute requiredPermission="role:read">
              <Roles />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="modules"
          element={
            <ProtectedRoute requiredPermission="module:read">
              <Modules />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="permissions"
          element={
            <ProtectedRoute requiredPermission="permission:read">
              <Permissions />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
