import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import usersReducer from "./slices/usersSlice";
import groupsReducer from "./slices/groupsSlice";
import rolesReducer from "./slices/rolesSlice";
import modulesReducer from "./slices/modulesSlice";
import permissionsReducer from "./slices/permissionsSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    groups: groupsReducer,
    roles: rolesReducer,
    modules: modulesReducer,
    permissions: permissionsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
