import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, requiredPermission }) => {
  const { isAuthenticated, checkPermission } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPermission) {
    const [module, action] = requiredPermission.split(':');
    if (!checkPermission(module, action)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute; 