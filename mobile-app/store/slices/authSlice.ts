/**
 * HealthFlow Mobile App - Auth Redux Slice
 * 
 * Manages authentication state.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AuthService from '../../services/auth.service';
import StorageService from '../../services/storage.service';
import { AuthState, AuthTokens, UserProfile } from '../../types';

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true, // Start as loading to check stored auth
  tokens: null,
  user: null,
  error: null,
};

// Async thunks

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const tokens = await StorageService.getTokens();
      
      if (!tokens) {
        return { isAuthenticated: false };
      }

      // Check if session is valid
      const isValid = await AuthService.checkSession();
      
      if (!isValid) {
        return { isAuthenticated: false };
      }

      // Get user profile
      const profile = await StorageService.getUserProfile();
      
      return {
        isAuthenticated: true,
        tokens,
        user: profile as UserProfile,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (_, { rejectWithValue }) => {
    try {
      const tokens = await AuthService.login();
      const user = await AuthService.getUserInfo(tokens.accessToken);
      
      return { tokens, user };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await AuthService.logout();
      return true;
    } catch (error: any) {
      // Still clear local state even if server logout fails
      await StorageService.clearAll();
      return true;
    }
  }
);

export const refreshTokens = createAsyncThunk(
  'auth/refreshTokens',
  async (_, { rejectWithValue }) => {
    try {
      const tokens = await AuthService.refreshTokens();
      return tokens;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    updateActivity: (state) => {
      StorageService.updateLastActivity();
    },
  },
  extraReducers: (builder) => {
    // Check auth status
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.tokens = action.payload.tokens || null;
        state.user = action.payload.user || null;
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.tokens = action.payload.tokens;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.tokens = null;
        state.user = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.tokens = null;
        state.user = null;
      });

    // Refresh tokens
    builder
      .addCase(refreshTokens.fulfilled, (state, action) => {
        state.tokens = action.payload;
      })
      .addCase(refreshTokens.rejected, (state) => {
        state.isAuthenticated = false;
        state.tokens = null;
        state.user = null;
      });
  },
});

export const { clearError, setLoading, updateActivity } = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

export default authSlice.reducer;
