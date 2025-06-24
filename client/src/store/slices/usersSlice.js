import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

const getAuthHeader = (getState) => {
  const { token } = getState().auth;
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/users`,
        getAuthHeader(getState),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const fetchUserById = createAsyncThunk(
  "users/fetchUserById",
  async (userId, { getState, rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/users/${userId}`,
        getAuthHeader(getState),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const createUser = createAsyncThunk(
  "users/createUser",
  async (userData, { getState, rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/users`,
        userData,
        getAuthHeader(getState),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ userId, userData }, { getState, rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/users/${userId}`,
        userData,
        getAuthHeader(getState),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (userId, { getState, rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/users/${userId}`, getAuthHeader(getState));
      return userId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

const initialState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch users";
      })
      // Fetch User by ID
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch user";
      })
      // Create User
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create user";
      })
      // Update User
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(
          (user) => user.id === action.payload.id,
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update user";
      })
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((user) => user.id !== action.payload);
        if (state.selectedUser?.id === action.payload) {
          state.selectedUser = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete user";
      });
  },
});

export const { clearSelectedUser, clearError } = usersSlice.actions;

export default usersSlice.reducer;
