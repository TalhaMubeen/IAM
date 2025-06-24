import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

const getAuthHeader = (getState) => {
  const { token } = getState().auth;
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const fetchModules = createAsyncThunk(
  "modules/fetchModules",
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/modules`,
        getAuthHeader(getState),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const fetchModuleById = createAsyncThunk(
  "modules/fetchModuleById",
  async (moduleId, { getState, rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/modules/${moduleId}`,
        getAuthHeader(getState),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const createModule = createAsyncThunk(
  "modules/createModule",
  async (moduleData, { getState, rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/modules`,
        moduleData,
        getAuthHeader(getState),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const updateModule = createAsyncThunk(
  "modules/updateModule",
  async ({ moduleId, moduleData }, { getState, rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/modules/${moduleId}`,
        moduleData,
        getAuthHeader(getState),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const deleteModule = createAsyncThunk(
  "modules/deleteModule",
  async (moduleId, { getState, rejectWithValue }) => {
    try {
      await axios.delete(
        `${API_URL}/modules/${moduleId}`,
        getAuthHeader(getState),
      );
      return moduleId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

const initialState = {
  modules: [],
  selectedModule: null,
  loading: false,
  error: null,
};

const modulesSlice = createSlice({
  name: "modules",
  initialState,
  reducers: {
    clearSelectedModule: (state) => {
      state.selectedModule = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Modules
      .addCase(fetchModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModules.fulfilled, (state, action) => {
        state.loading = false;
        state.modules = action.payload;
      })
      .addCase(fetchModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch modules";
      })
      // Fetch Module by ID
      .addCase(fetchModuleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModuleById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedModule = action.payload;
      })
      .addCase(fetchModuleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch module";
      })
      // Create Module
      .addCase(createModule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createModule.fulfilled, (state, action) => {
        state.loading = false;
        state.modules.push(action.payload);
      })
      .addCase(createModule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create module";
      })
      // Update Module
      .addCase(updateModule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateModule.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.modules.findIndex(
          (module) => module.id === action.payload.id,
        );
        if (index !== -1) {
          state.modules[index] = action.payload;
        }
        if (state.selectedModule?.id === action.payload.id) {
          state.selectedModule = action.payload;
        }
      })
      .addCase(updateModule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update module";
      })
      // Delete Module
      .addCase(deleteModule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteModule.fulfilled, (state, action) => {
        state.loading = false;
        state.modules = state.modules.filter(
          (module) => module.id !== action.payload,
        );
        if (state.selectedModule?.id === action.payload) {
          state.selectedModule = null;
        }
      })
      .addCase(deleteModule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete module";
      });
  },
});

export const { clearSelectedModule, clearError } = modulesSlice.actions;

export default modulesSlice.reducer;
