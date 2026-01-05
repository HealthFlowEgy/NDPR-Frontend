/**
 * HealthFlow Mobile App - Credentials Redux Slice
 * 
 * Manages credentials and DID state with backend integration.
 * Updated: January 5, 2026 - Added Credentials Service integration
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import IdentityService from '../../services/identity.service';
import CredentialsService from '../../services/credentials.service';
import {
  CredentialsState,
  Credential,
  DIDDocument,
  IssueCredentialRequest,
  CredentialVerification,
  CredentialSearchQuery,
} from '../../types';

const initialState: CredentialsState = {
  credentials: [],
  userDID: null,
  isLoading: false,
  isSyncing: false,
  isIssuing: false,
  lastSyncTime: null,
  error: null,
};

// ============================================
// DID Async Thunks
// ============================================

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

// ============================================
// Credentials Async Thunks (NEW)
// ============================================

/**
 * Fetch all credentials from backend
 */
export const fetchCredentials = createAsyncThunk(
  'credentials/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const credentials = await CredentialsService.getCredentials();
      return credentials;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Search credentials with filters
 */
export const searchCredentials = createAsyncThunk(
  'credentials/search',
  async (query: CredentialSearchQuery, { rejectWithValue }) => {
    try {
      const credentials = await CredentialsService.searchCredentials(query);
      return credentials;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get a specific credential by ID
 */
export const fetchCredentialById = createAsyncThunk(
  'credentials/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const credential = await CredentialsService.getCredentialById(id);
      if (!credential) {
        return rejectWithValue('Credential not found');
      }
      return credential;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Verify a credential
 */
export const verifyCredential = createAsyncThunk(
  'credentials/verify',
  async (id: string, { rejectWithValue }) => {
    try {
      const verification = await CredentialsService.verifyCredential(id);
      if (!verification) {
        return rejectWithValue('Verification failed');
      }
      return { id, verification };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Request issuance of a new credential
 */
export const issueCredential = createAsyncThunk(
  'credentials/issue',
  async (request: IssueCredentialRequest, { rejectWithValue, dispatch }) => {
    try {
      const response = await CredentialsService.issueCredential(request);
      if (!response) {
        return rejectWithValue('Failed to issue credential');
      }
      // Refresh credentials list after successful issuance
      dispatch(fetchCredentials());
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Sync credentials with backend (for pull-to-refresh)
 */
export const syncCredentials = createAsyncThunk(
  'credentials/sync',
  async (_, { rejectWithValue }) => {
    try {
      const success = await CredentialsService.syncCredentials();
      if (!success) {
        return rejectWithValue('Sync failed');
      }
      const credentials = await CredentialsService.getCredentials();
      return credentials;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Load cached credentials (for offline mode)
 */
export const loadCachedCredentials = createAsyncThunk(
  'credentials/loadCached',
  async (_, { rejectWithValue }) => {
    try {
      const credentials = await CredentialsService.getCachedCredentials();
      return credentials;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// ============================================
// Slice
// ============================================

const credentialsSlice = createSlice({
  name: 'credentials',
  initialState,
  reducers: {
    addCredential: (state, action: PayloadAction<Credential>) => {
      // Avoid duplicates
      const exists = state.credentials.some(c => c.id === action.payload.id);
      if (!exists) {
        state.credentials.push(action.payload);
      }
    },
    removeCredential: (state, action: PayloadAction<string>) => {
      state.credentials = state.credentials.filter(
        c => c.id !== action.payload
      );
    },
    setCredentials: (state, action: PayloadAction<Credential[]>) => {
      state.credentials = action.payload;
    },
    updateCredentialStatus: (state, action: PayloadAction<{ id: string; status: 'active' | 'revoked' | 'expired' }>) => {
      const credential = state.credentials.find(c => c.id === action.payload.id);
      if (credential) {
        credential.status = action.payload.status;
      }
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

    // Fetch all credentials
    builder
      .addCase(fetchCredentials.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCredentials.fulfilled, (state, action) => {
        state.isLoading = false;
        state.credentials = action.payload;
        state.lastSyncTime = new Date().toISOString();
      })
      .addCase(fetchCredentials.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Search credentials
    builder
      .addCase(searchCredentials.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchCredentials.fulfilled, (state, action) => {
        state.isLoading = false;
        state.credentials = action.payload;
      })
      .addCase(searchCredentials.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch credential by ID
    builder
      .addCase(fetchCredentialById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCredentialById.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update or add the credential
        const index = state.credentials.findIndex(c => c.id === action.payload.id);
        if (index >= 0) {
          state.credentials[index] = action.payload;
        } else {
          state.credentials.push(action.payload);
        }
      })
      .addCase(fetchCredentialById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Verify credential
    builder
      .addCase(verifyCredential.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyCredential.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update credential status based on verification
        const credential = state.credentials.find(c => c.id === action.payload.id);
        if (credential && action.payload.verification) {
          if (action.payload.verification.status === 'REVOKED') {
            credential.status = 'revoked';
          } else if (action.payload.verification.status === 'EXPIRED') {
            credential.status = 'expired';
          } else if (action.payload.verification.status === 'ISSUED') {
            credential.status = 'active';
          }
        }
      })
      .addCase(verifyCredential.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Issue credential
    builder
      .addCase(issueCredential.pending, (state) => {
        state.isIssuing = true;
        state.error = null;
      })
      .addCase(issueCredential.fulfilled, (state, action) => {
        state.isIssuing = false;
        // Add the newly issued credential
        if (action.payload?.credential) {
          state.credentials.push(action.payload.credential);
        }
      })
      .addCase(issueCredential.rejected, (state, action) => {
        state.isIssuing = false;
        state.error = action.payload as string;
      });

    // Sync credentials
    builder
      .addCase(syncCredentials.pending, (state) => {
        state.isSyncing = true;
        state.error = null;
      })
      .addCase(syncCredentials.fulfilled, (state, action) => {
        state.isSyncing = false;
        state.credentials = action.payload;
        state.lastSyncTime = new Date().toISOString();
      })
      .addCase(syncCredentials.rejected, (state, action) => {
        state.isSyncing = false;
        state.error = action.payload as string;
      });

    // Load cached credentials
    builder
      .addCase(loadCachedCredentials.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadCachedCredentials.fulfilled, (state, action) => {
        state.isLoading = false;
        // Only use cached if we don't have fresh data
        if (state.credentials.length === 0) {
          state.credentials = action.payload;
        }
      })
      .addCase(loadCachedCredentials.rejected, (state, action) => {
        state.isLoading = false;
        // Don't set error for cache miss
      });
  },
});

export const {
  addCredential,
  removeCredential,
  setCredentials,
  updateCredentialStatus,
  clearError,
  resetState,
} = credentialsSlice.actions;

// ============================================
// Selectors
// ============================================

export const selectCredentialsState = (state: { credentials: CredentialsState }) => state.credentials;
export const selectCredentials = (state: { credentials: CredentialsState }) => state.credentials.credentials;
export const selectUserDID = (state: { credentials: CredentialsState }) => state.credentials.userDID;
export const selectCredentialsLoading = (state: { credentials: CredentialsState }) => state.credentials.isLoading;
export const selectCredentialsSyncing = (state: { credentials: CredentialsState }) => state.credentials.isSyncing;
export const selectCredentialsIssuing = (state: { credentials: CredentialsState }) => state.credentials.isIssuing;
export const selectCredentialsError = (state: { credentials: CredentialsState }) => state.credentials.error;
export const selectHasDID = (state: { credentials: CredentialsState }) => state.credentials.userDID !== null;
export const selectLastSyncTime = (state: { credentials: CredentialsState }) => state.credentials.lastSyncTime;

// Derived selectors
export const selectActiveCredentials = (state: { credentials: CredentialsState }) => 
  state.credentials.credentials.filter(c => c.status !== 'revoked' && c.status !== 'expired');

export const selectExpiringCredentials = (state: { credentials: CredentialsState }) => 
  state.credentials.credentials.filter(c => {
    if (!c.expirationDate) return false;
    const expiryDate = new Date(c.expirationDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
  });

export const selectCredentialById = (id: string) => (state: { credentials: CredentialsState }) =>
  state.credentials.credentials.find(c => c.id === id);

export default credentialsSlice.reducer;
