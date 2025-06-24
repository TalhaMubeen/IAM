import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

// Async thunks
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      localStorage.setItem("token", response.data.token);
      // Fetch permissions after successful login
      await dispatch(fetchPermissions());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Login failed" });
    }
  },
);

export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const fetchPermissions = createAsyncThunk(
  "auth/fetchPermissions",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      if (!token) {
        return rejectWithValue({ message: "No token available" });
      }
      const response = await axios.get(`${API_URL}/auth/me/permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.permissions;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to fetch permissions" });
    }
  }
);

const initialState = {
  token: localStorage.getItem("token"),
  user: null,
  permissions: {},
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.permissions = {};
      localStorage.removeItem("token");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Login failed";
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Registration failed";
      })
      // Fetch Permissions
      .addCase(fetchPermissions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = action.payload;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch permissions";
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
