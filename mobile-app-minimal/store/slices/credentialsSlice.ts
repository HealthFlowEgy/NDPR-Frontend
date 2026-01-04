/**
 * HealthFlow Mobile App - Credentials Redux Slice
 * 
 * Manages credentials and DID state.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import IdentityService from '../../services/identity.service';
import {
  CredentialsState,
  ProfessionalCredential,
  DIDDocument,
} from '../../types';

const initialState: CredentialsState = {
  credentials: [],
  userDID: null,
  isLoading: false,
  error: null,
};

// Async thunks

export const loadUserDID = createAsyncThunk(
  'credentials/loadDID',
  async (_, { rejectWithValue }) => {
    try {
      const did = await IdentityService.getUserDID();
      return did;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const generateUserDID = createAsyncThunk(
  'credentials/generateDID',
  async (alsoKnownAs: string[] | undefined, { rejectWithValue }) => {
    try {
      const did = await IdentityService.generateDID(alsoKnownAs);
      return did;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const resolveDID = createAsyncThunk(
  'credentials/resolveDID',
  async (did: string, { rejectWithValue }) => {
    try {
      return await IdentityService.resolveDID(did);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice

const credentialsSlice = createSlice({
  name: 'credentials',
  initialState,
  reducers: {
    addCredential: (state, action: PayloadAction<ProfessionalCredential>) => {
      state.credentials.push(action.payload);
    },
    removeCredential: (state, action: PayloadAction<string>) => {
      state.credentials = state.credentials.filter(
        c => c.id !== action.payload
      );
    },
    setCredentials: (state, action: PayloadAction<ProfessionalCredential[]>) => {
      state.credentials = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    // Load user DID
    builder
      .addCase(loadUserDID.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUserDID.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userDID = action.payload;
      })
      .addCase(loadUserDID.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Generate user DID
    builder
      .addCase(generateUserDID.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateUserDID.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userDID = action.payload;
      })
      .addCase(generateUserDID.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Resolve DID
    builder
      .addCase(resolveDID.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resolveDID.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resolveDID.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  addCredential,
  removeCredential,
  setCredentials,
  clearError,
  resetState,
} = credentialsSlice.actions;

// Selectors
export const selectCredentialsState = (state: { credentials: CredentialsState }) => state.credentials;
export const selectCredentials = (state: { credentials: CredentialsState }) => state.credentials.credentials;
export const selectUserDID = (state: { credentials: CredentialsState }) => state.credentials.userDID;
export const selectCredentialsLoading = (state: { credentials: CredentialsState }) => state.credentials.isLoading;
export const selectCredentialsError = (state: { credentials: CredentialsState }) => state.credentials.error;
export const selectHasDID = (state: { credentials: CredentialsState }) => state.credentials.userDID !== null;

export default credentialsSlice.reducer;
