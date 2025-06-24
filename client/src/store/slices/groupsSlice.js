import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

const getAuthHeader = (getState) => {
  const { token } = getState().auth;
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const fetchGroups = createAsyncThunk(
  "groups/fetchGroups",
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/groups`,
        getAuthHeader(getState),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const fetchGroupById = createAsyncThunk(
  "groups/fetchGroupById",
  async (groupId, { getState, rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/groups/${groupId}`,
        getAuthHeader(getState),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const createGroup = createAsyncThunk(
  "groups/createGroup",
  async (groupData, { getState, rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/groups`,
        groupData,
        getAuthHeader(getState),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const updateGroup = createAsyncThunk(
  "groups/updateGroup",
  async ({ groupId, groupData }, { getState, rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/groups/${groupId}`,
        groupData,
        getAuthHeader(getState),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const deleteGroup = createAsyncThunk(
  "groups/deleteGroup",
  async (groupId, { getState, rejectWithValue }) => {
    try {
      await axios.delete(
        `${API_URL}/groups/${groupId}`,
        getAuthHeader(getState),
      );
      return groupId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const assignRoleToGroup = createAsyncThunk(
  "groups/assignRoleToGroup",
  async ({ groupId, roleId }, { getState, rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/groups/${groupId}/roles`,
        { roleId },
        getAuthHeader(getState),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const removeRoleFromGroup = createAsyncThunk(
  "groups/removeRoleFromGroup",
  async ({ groupId, roleId }, { getState, rejectWithValue }) => {
    try {
      await axios.delete(
        `${API_URL}/groups/${groupId}/roles/${roleId}`,
        getAuthHeader(getState),
      );
      return { groupId, roleId };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

const initialState = {
  groups: [],
  selectedGroup: null,
  loading: false,
  error: null,
};

const groupsSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {
    clearSelectedGroup: (state) => {
      state.selectedGroup = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Groups
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch groups";
      })
      // Fetch Group by ID
      .addCase(fetchGroupById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroupById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedGroup = action.payload;
      })
      .addCase(fetchGroupById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch group";
      })
      // Create Group
      .addCase(createGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups.push(action.payload);
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create group";
      })
      // Update Group
      .addCase(updateGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGroup.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.groups.findIndex(
          (group) => group.id === action.payload.id,
        );
        if (index !== -1) {
          state.groups[index] = action.payload;
        }
        if (state.selectedGroup?.id === action.payload.id) {
          state.selectedGroup = action.payload;
        }
      })
      .addCase(updateGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update group";
      })
      // Delete Group
      .addCase(deleteGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = state.groups.filter(
          (group) => group.id !== action.payload,
        );
        if (state.selectedGroup?.id === action.payload) {
          state.selectedGroup = null;
        }
      })
      .addCase(deleteGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete group";
      })
      // Assign Role to Group
      .addCase(assignRoleToGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignRoleToGroup.fulfilled, (state, action) => {
        state.loading = false;
        if (state.selectedGroup?.id === action.payload.id) {
          state.selectedGroup = action.payload;
        }
      })
      .addCase(assignRoleToGroup.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to assign role to group";
      })
      // Remove Role from Group
      .addCase(removeRoleFromGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeRoleFromGroup.fulfilled, (state, action) => {
        state.loading = false;
        if (state.selectedGroup?.id === action.payload.groupId) {
          state.selectedGroup.roles = state.selectedGroup.roles.filter(
            (role) => role.id !== action.payload.roleId,
          );
        }
      })
      .addCase(removeRoleFromGroup.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to remove role from group";
      });
  },
});

export const { clearSelectedGroup, clearError } = groupsSlice.actions;

export default groupsSlice.reducer;
