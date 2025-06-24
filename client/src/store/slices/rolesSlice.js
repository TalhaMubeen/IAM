import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

const getAuthHeader = (getState) => {
  const { token } = getState().auth;
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const fetchRoles = createAsyncThunk(
  "roles/fetchRoles",
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/roles`,
        getAuthHeader(getState),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const fetchRoleById = createAsyncThunk(
  "roles/fetchRoleById",
  async (roleId, { getState, rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/roles/${roleId}`,
        getAuthHeader(getState),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const createRole = createAsyncThunk(
  "roles/createRole",
  async (roleData, { getState, rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/roles`,
        roleData,
        getAuthHeader(getState),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const updateRole = createAsyncThunk(
  "roles/updateRole",
  async ({ roleId, roleData }, { getState, rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/roles/${roleId}`,
        roleData,
        getAuthHeader(getState),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const deleteRole = createAsyncThunk(
  "roles/deleteRole",
  async (roleId, { getState, rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/roles/${roleId}`, getAuthHeader(getState));
      return roleId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const assignPermissionToRole = createAsyncThunk(
  "roles/assignPermissionToRole",
  async ({ roleId, permissionId }, { getState, rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/roles/${roleId}/permissions/${permissionId}`,
        {},
        getAuthHeader(getState),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const removePermissionFromRole = createAsyncThunk(
  "roles/removePermissionFromRole",
  async ({ roleId, permissionId }, { getState, rejectWithValue }) => {
    try {
      await axios.delete(
        `${API_URL}/roles/${roleId}/permissions/${permissionId}`,
        getAuthHeader(getState),
      );
      return { roleId, permissionId };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

const initialState = {
  roles: [],
  selectedRole: null,
  loading: false,
  error: null,
};

const rolesSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {
    clearSelectedRole: (state) => {
      state.selectedRole = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Roles
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch roles";
      })
      // Fetch Role by ID
      .addCase(fetchRoleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoleById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRole = action.payload;
      })
      .addCase(fetchRoleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch role";
      })
      // Create Role
      .addCase(createRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.loading = false;
        state.roles.push(action.payload);
      })
      .addCase(createRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create role";
      })
      // Update Role
      .addCase(updateRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.roles.findIndex(
          (role) => role.id === action.payload.id,
        );
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
        if (state.selectedRole?.id === action.payload.id) {
          state.selectedRole = action.payload;
        }
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update role";
      })
      // Delete Role
      .addCase(deleteRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = state.roles.filter((role) => role.id !== action.payload);
        if (state.selectedRole?.id === action.payload) {
          state.selectedRole = null;
        }
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete role";
      })
      // Assign Permission to Role
      .addCase(assignPermissionToRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignPermissionToRole.fulfilled, (state, action) => {
        state.loading = false;
        if (state.selectedRole?.id === action.payload.id) {
          state.selectedRole = action.payload;
        }
      })
      .addCase(assignPermissionToRole.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to assign permission to role";
      })
      // Remove Permission from Role
      .addCase(removePermissionFromRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removePermissionFromRole.fulfilled, (state, action) => {
        state.loading = false;
        if (state.selectedRole?.id === action.payload.roleId) {
          state.selectedRole.permissions =
            state.selectedRole.permissions.filter(
              (permission) => permission.id !== action.payload.permissionId,
            );
        }
      })
      .addCase(removePermissionFromRole.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to remove permission from role";
      });
  },
});

export const { clearSelectedRole, clearError } = rolesSlice.actions;

export default rolesSlice.reducer;
