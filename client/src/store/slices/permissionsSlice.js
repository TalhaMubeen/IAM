import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

const getAuthHeader = (getState) => {
  const { token } = getState().auth;
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const fetchPermissions = createAsyncThunk(
  "permissions/fetchPermissions",
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/permissions`,
        getAuthHeader(getState),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const fetchPermissionById = createAsyncThunk(
  "permissions/fetchPermissionById",
  async (permissionId, { getState, rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/permissions/${permissionId}`,
        getAuthHeader(getState),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const fetchPermissionsByModule = createAsyncThunk(
  "permissions/fetchPermissionsByModule",
  async (moduleId, { getState, rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/permissions/module/${moduleId}`,
        getAuthHeader(getState),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const createPermission = createAsyncThunk(
  "permissions/createPermission",
  async (permissionData, { getState, rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/permissions`,
        permissionData,
        getAuthHeader(getState),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const updatePermission = createAsyncThunk(
  "permissions/updatePermission",
  async ({ permissionId, permissionData }, { getState, rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/permissions/${permissionId}`,
        permissionData,
        getAuthHeader(getState),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const deletePermission = createAsyncThunk(
  "permissions/deletePermission",
  async (permissionId, { getState, rejectWithValue }) => {
    try {
      await axios.delete(
        `${API_URL}/permissions/${permissionId}`,
        getAuthHeader(getState),
      );
      return permissionId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

const initialState = {
  permissions: [],
  selectedPermission: null,
  modulePermissions: [],
  loading: false,
  error: null,
};

const permissionsSlice = createSlice({
  name: "permissions",
  initialState,
  reducers: {
    clearSelectedPermission: (state) => {
      state.selectedPermission = null;
    },
    clearModulePermissions: (state) => {
      state.modulePermissions = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Permissions
      .addCase(fetchPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = action.payload;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch permissions";
      })
      // Fetch Permission by ID
      .addCase(fetchPermissionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissionById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPermission = action.payload;
      })
      .addCase(fetchPermissionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch permission";
      })
      // Fetch Permissions by Module
      .addCase(fetchPermissionsByModule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissionsByModule.fulfilled, (state, action) => {
        state.loading = false;
        state.modulePermissions = action.payload;
      })
      .addCase(fetchPermissionsByModule.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch module permissions";
      })
      // Create Permission
      .addCase(createPermission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPermission.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions.push(action.payload);
        if (state.modulePermissions.length > 0) {
          state.modulePermissions.push(action.payload);
        }
      })
      .addCase(createPermission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create permission";
      })
      // Update Permission
      .addCase(updatePermission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePermission.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.permissions.findIndex(
          (p) => p.id === action.payload.id,
        );
        if (index !== -1) {
          state.permissions[index] = action.payload;
        }
        if (state.selectedPermission?.id === action.payload.id) {
          state.selectedPermission = action.payload;
        }
        // Update in module permissions if exists
        state.modulePermissions = state.modulePermissions.map((permission) =>
          permission.id === action.payload.id ? action.payload : permission,
        );
      })
      .addCase(updatePermission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update permission";
      })
      // Delete Permission
      .addCase(deletePermission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePermission.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = state.permissions.filter(
          (permission) => permission.id !== action.payload,
        );
        state.modulePermissions = state.modulePermissions.filter(
          (permission) => permission.id !== action.payload,
        );
        if (state.selectedPermission?.id === action.payload) {
          state.selectedPermission = null;
        }
      })
      .addCase(deletePermission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete permission";
      });
  },
});

export const { clearSelectedPermission, clearModulePermissions, clearError } =
  permissionsSlice.actions;

export default permissionsSlice.reducer;
