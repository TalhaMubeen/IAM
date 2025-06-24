import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login as loginAction, logout as logoutAction, register as registerAction } from '../store/slices/authSlice';
import { authAPI } from '../services/api.service';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, permissions, loading, error } = useSelector((state) => state.auth);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      dispatch(loginAction(response.data));
      navigate('/');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      throw new Error(errorMessage);
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      dispatch(registerAction(response.data));
      navigate('/login');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    dispatch(logoutAction());
    navigate('/login');
  };

  const checkPermission = (module, action) => {
    if (!permissions || !permissions[module]) {
      return false;
    }
    return permissions[module].includes(action);
  };

  const hasAnyPermission = (module, actions) => {
    if (!permissions || !permissions[module]) {
      return false;
    }
    return actions.some(action => permissions[module].includes(action));
  };

  const hasAllPermissions = (module, actions) => {
    if (!permissions || !permissions[module]) {
      return false;
    }
    return actions.every(action => permissions[module].includes(action));
  };

  return {
    user,
    token,
    permissions,
    loading,
    error,
    login,
    register,
    logout,
    checkPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAuthenticated: !!token
  };
}; 