/**
 * HealthFlow Mobile App - Signing Redux Slice
 * 
 * Manages signing requests state.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import SigningService from '../../services/signing.service';
import {
  SigningState,
  SigningRequest,
  SigningHistoryItem,
  SigningStats,
  SigningResponse,
} from '../../types';

const initialState: SigningState = {
  requests: [],
  history: [],
  stats: null,
  selectedRequestId: null,
  isLoading: false,
  isProcessing: false,
  error: null,
};

// Async thunks

export const fetchPendingRequests = createAsyncThunk(
  'signing/fetchPending',
  async (_, { rejectWithValue }) => {
    try {
      return await SigningService.getPendingRequests();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSigningStats = createAsyncThunk(
  'signing/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await SigningService.getStats();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSigningHistory = createAsyncThunk(
  'signing/fetchHistory',
  async ({ limit = 50, offset = 0 }: { limit?: number; offset?: number }, { rejectWithValue }) => {
    try {
      return await SigningService.getHistory(limit, offset);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const approveRequest = createAsyncThunk(
  'signing/approve',
  async (requestId: string, { rejectWithValue }) => {
    try {
      const response = await SigningService.approveRequest(requestId);
      return { requestId, response };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const rejectRequest = createAsyncThunk(
  'signing/reject',
  async ({ requestId, reason }: { requestId: string; reason: string }, { rejectWithValue }) => {
    try {
      const response = await SigningService.rejectRequest(requestId, reason);
      return { requestId, response };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice

const signingSlice = createSlice({
  name: 'signing',
  initialState,
  reducers: {
    selectRequest: (state, action: PayloadAction<string | null>) => {
      state.selectedRequestId = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    removeRequest: (state, action: PayloadAction<string>) => {
      state.requests = state.requests.filter(r => r.id !== action.payload);
    },
    updateRequestStatus: (state, action: PayloadAction<{ id: string; status: SigningRequest['status'] }>) => {
      const request = state.requests.find(r => r.id === action.payload.id);
      if (request) {
        request.status = action.payload.status;
      }
    },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch pending requests
    builder
      .addCase(fetchPendingRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requests = action.payload;
      })
      .addCase(fetchPendingRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch stats
    builder
      .addCase(fetchSigningStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });

    // Fetch history
    builder
      .addCase(fetchSigningHistory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSigningHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.history = action.payload;
      })
      .addCase(fetchSigningHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Approve request
    builder
      .addCase(approveRequest.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(approveRequest.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.requests = state.requests.filter(r => r.id !== action.payload.requestId);
        if (state.stats) {
          state.stats.total_signed += 1;
          state.stats.total_pending -= 1;
        }
      })
      .addCase(approveRequest.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload as string;
      });

    // Reject request
    builder
      .addCase(rejectRequest.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(rejectRequest.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.requests = state.requests.filter(r => r.id !== action.payload.requestId);
        if (state.stats) {
          state.stats.total_rejected += 1;
          state.stats.total_pending -= 1;
        }
      })
      .addCase(rejectRequest.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  selectRequest,
  clearError,
  removeRequest,
  updateRequestStatus,
  resetState,
} = signingSlice.actions;

// Selectors
export const selectSigningState = (state: { signing: SigningState }) => state.signing;
export const selectPendingRequests = (state: { signing: SigningState }) => state.signing.requests;
export const selectSigningHistory = (state: { signing: SigningState }) => state.signing.history;
export const selectSigningStats = (state: { signing: SigningState }) => state.signing.stats;
export const selectSelectedRequestId = (state: { signing: SigningState }) => state.signing.selectedRequestId;
export const selectIsProcessing = (state: { signing: SigningState }) => state.signing.isProcessing;
export const selectSigningError = (state: { signing: SigningState }) => state.signing.error;
export const selectPendingCount = (state: { signing: SigningState }) => 
  state.signing.requests.filter(r => r.status === 'pending').length;
export const selectUrgentCount = (state: { signing: SigningState }) => 
  state.signing.requests.filter(r => r.priority === 'urgent').length;

export default signingSlice.reducer;
