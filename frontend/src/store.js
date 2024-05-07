import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./slices/apiSlice";
import authReducer from "./slices/authSlice";
import bookingReducer from "./slices/bookingSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import { thunk } from "redux-thunk";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "booking"], // put the reducers that needs to be persisted in the localStorage
};

const reducers = combineReducers({
  api: apiSlice.reducer,
  auth: authReducer,
  booking: bookingReducer,
});

const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: () => [apiSlice.middleware, thunk], // Add redux thunk middleware to not persist non-serializable values, e.g. functions.
  devTools: true,
});

export const persistor = persistStore(store);
