import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { generateUser, checkUser, startUser, getCredits } from '../User-View/User-View-Api';

// Async thunk for generating user
export const generateUserAsync = createAsyncThunk(
  'user/generateUser',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await generateUser();
      
      // If generateUser is successful (status 200), automatically trigger the flow
      if (response.status === 200 && response.data) {
        const { zoomdocs_auth_id, zoomdocs_user_id } = response.data;
        
        console.log('[UserSlice] Generate User successful, starting API chain:', {
          zoomdocs_auth_id,
          zoomdocs_user_id
        });
        
        // Store credentials in localStorage immediately
        if (zoomdocs_auth_id) {
          localStorage.setItem('zoomdocs_auth_id', zoomdocs_auth_id);
        }
        if (zoomdocs_user_id) {
          localStorage.setItem('zoomdocs_user_id', zoomdocs_user_id);
        }
        
        // Start the API chain: checkUser -> startUser -> getCredits
        dispatch(checkUserAsync({ 
          zoomdocs_auth_id, 
          zoomdocs_user_id, 
          skipGenerateOnFail: true 
        }));
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for checking existing user
export const checkUserAsync = createAsyncThunk(
  'user/checkUser',
  async ({ zoomdocs_auth_id, zoomdocs_user_id, skipGenerateOnFail = false }, { rejectWithValue, dispatch }) => {
    try {
      const response = await checkUser(zoomdocs_auth_id, zoomdocs_user_id);
      
      // If status is true, automatically call start user API
      if (response.data.status === true) {
        dispatch(startUserAsync({ 
          zoomdocs_auth_id, 
          zoomdocs_user_id, 
          skipGenerateOnFail 
        }));
      } else if (!skipGenerateOnFail) {
        // If status is false and not part of generate flow, clear localStorage and generate new user
        localStorage.removeItem('zoomdocs_auth_id');
        localStorage.removeItem('zoomdocs_user_id');
        dispatch(generateUserAsync());
      }
      
      return response.data;
    } catch (error) {
      // Only regenerate user if not part of the generate flow
      if (!skipGenerateOnFail) {
        localStorage.removeItem('zoomdocs_auth_id');
        localStorage.removeItem('zoomdocs_user_id');
        dispatch(generateUserAsync());
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for starting user session
export const startUserAsync = createAsyncThunk(
  'user/startUser',
  async ({ zoomdocs_auth_id, zoomdocs_user_id, skipGenerateOnFail = false }, { rejectWithValue, dispatch }) => {
    try {
      const response = await startUser(zoomdocs_auth_id, zoomdocs_user_id);
      
      // If status is true, automatically call credits API
      if (response.data.status === true) {
        dispatch(getCreditsAsync({ zoomdocs_auth_id, zoomdocs_user_id }));
      } else if (!skipGenerateOnFail) {
        // If status is false and not part of generate flow, clear localStorage and generate new user
        localStorage.removeItem('zoomdocs_auth_id');
        localStorage.removeItem('zoomdocs_user_id');
        dispatch(generateUserAsync());
      }
      
      return response.data;
    } catch (error) {
      // Only regenerate user if not part of the generate flow
      if (!skipGenerateOnFail) {
        localStorage.removeItem('zoomdocs_auth_id');
        localStorage.removeItem('zoomdocs_user_id');
        dispatch(generateUserAsync());
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for getting user credits
export const getCreditsAsync = createAsyncThunk(
  'user/getCredits',
  async ({ zoomdocs_auth_id, zoomdocs_user_id }, { rejectWithValue }) => {
    try {
      const response = await getCredits(zoomdocs_auth_id, zoomdocs_user_id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    zoomdocs_auth_id: localStorage.getItem('zoomdocs_auth_id') || null,
    zoomdocs_user_id: localStorage.getItem('zoomdocs_user_id') || null,
    credits: null,
    isLoading: false,
    error: null,
    isInitialized: false
  },
  reducers: {
    clearUser: (state) => {
      state.zoomdocs_auth_id = null;
      state.zoomdocs_user_id = null;
      state.credits = null;
      state.error = null;
      localStorage.removeItem('zoomdocs_auth_id');
      localStorage.removeItem('zoomdocs_user_id');
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Generate User cases
      .addCase(generateUserAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateUserAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.zoomdocs_auth_id = action.payload.zoomdocs_auth_id;
        state.zoomdocs_user_id = action.payload.zoomdocs_user_id;
        state.isInitialized = true;
        state.error = null;

        // Store in localStorage
        if (action.payload.zoomdocs_auth_id) {
          localStorage.setItem('zoomdocs_auth_id', action.payload.zoomdocs_auth_id);
        }
        if (action.payload.zoomdocs_user_id) {
          localStorage.setItem('zoomdocs_user_id', action.payload.zoomdocs_user_id);
        }
      })
      .addCase(generateUserAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isInitialized = true;
      })
      // Check User cases
      .addCase(checkUserAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkUserAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        console.log('Check user API response:', action.payload);
        
        // If status is false, clear user data from state
        if (action.payload.status === false) {
          state.zoomdocs_auth_id = null;
          state.zoomdocs_user_id = null;
          state.credits = null;
          state.isInitialized = false; // Reset to allow flow restart
        } else {
          state.isInitialized = true;
        }
      })
      .addCase(checkUserAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isInitialized = true;
        console.error('Check user API error:', action.payload);
      })
      // Start User cases
      .addCase(startUserAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startUserAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        console.log('Start user API response:', action.payload);
        
        // If status is false, clear user data from state
        if (action.payload.status === false) {
          state.zoomdocs_auth_id = null;
          state.zoomdocs_user_id = null;
          state.credits = null;
          state.isInitialized = false; // Reset to allow flow restart
        }
      })
      .addCase(startUserAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        console.error('Start user API error:', action.payload);
      })
      // Get Credits cases
      .addCase(getCreditsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCreditsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.credits = action.payload;
        state.error = null;
        console.log('Credits API response:', action.payload);
      })
      .addCase(getCreditsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        console.error('Credits API error:', action.payload);
      });
  }
});

export const { clearUser, clearError } = userSlice.actions;
export default userSlice.reducer;
