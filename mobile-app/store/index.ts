/**
 * HealthFlow Mobile App - Redux Store
 * 
 * Configures and exports the Redux store with all slices.
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import authReducer from './slices/authSlice';
import signingReducer from './slices/signingSlice';
import credentialsReducer from './slices/credentialsSlice';

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  signing: signingReducer,
  credentials: credentialsReducer,
});

// Configure store - use process.env.NODE_ENV for dev check
const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable to avoid issues with non-serializable data
    }),
  devTools: isDev,
});

// Infer types from store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Export all slice actions and selectors
export * from './slices/authSlice';
export * from './slices/signingSlice';
export * from './slices/credentialsSlice';

export default store;
