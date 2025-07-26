import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
	checkUser,
	generateUser,
	getCredits,
	startUser,
} from "../User-View/User-View-Api";

// Helper function to manage localStorage
const userStorage = {
	set: (authId, userId) => {
		if (authId) localStorage.setItem("zoomdocs_auth_id", authId);
		if (userId) localStorage.setItem("zoomdocs_user_id", userId);
	},
	get: () => ({
		zoomdocs_auth_id: localStorage.getItem("zoomdocs_auth_id"),
		zoomdocs_user_id: localStorage.getItem("zoomdocs_user_id"),
	}),
	clear: () => {
		localStorage.removeItem("zoomdocs_auth_id");
		localStorage.removeItem("zoomdocs_user_id");
	},
};

// Helper function for error handling
const handleApiError = (error) => {
	return error.response?.data || error.message || "An unknown error occurred";
};

// Async thunk for generating user
export const generateUserAsync = createAsyncThunk(
	"user/generateUser",
	async (_, { rejectWithValue, dispatch }) => {
		try {
			const response = await generateUser();

			if (response.status === 200 && response.data) {
				const { zoomdocs_auth_id, zoomdocs_user_id } = response.data;

				// Store credentials immediately
				userStorage.set(zoomdocs_auth_id, zoomdocs_user_id);

				// Continue the flow
				dispatch(
					checkUserAsync({
						zoomdocs_auth_id,
						zoomdocs_user_id,
						skipGenerateOnFail: true,
					})
				);
			}

			return response.data;
		} catch (error) {
			return rejectWithValue(handleApiError(error));
		}
	}
);

// Async thunk for checking existing user
export const checkUserAsync = createAsyncThunk(
	"user/checkUser",
	async (
		{ zoomdocs_auth_id, zoomdocs_user_id, skipGenerateOnFail = false },
		{ rejectWithValue, dispatch }
	) => {
		try {
			const response = await checkUser(
				zoomdocs_auth_id,
				zoomdocs_user_id
			);

			if (response.data.status === true) {
				dispatch(
					startUserAsync({
						zoomdocs_auth_id,
						zoomdocs_user_id,
						skipGenerateOnFail,
					})
				);
			} else if (!skipGenerateOnFail) {
				userStorage.clear();
				dispatch(generateUserAsync());
			}

			return response.data;
		} catch (error) {
			if (!skipGenerateOnFail) {
				userStorage.clear();
				dispatch(generateUserAsync());
			}
			return rejectWithValue(handleApiError(error));
		}
	}
);

// Async thunk for starting user session
export const startUserAsync = createAsyncThunk(
	"user/startUser",
	async (
		{ zoomdocs_auth_id, zoomdocs_user_id, skipGenerateOnFail = false },
		{ rejectWithValue, dispatch }
	) => {
		try {
			const response = await startUser(
				zoomdocs_auth_id,
				zoomdocs_user_id
			);

			if (response.data.status === true) {
				dispatch(
					getCreditsAsync({ zoomdocs_auth_id, zoomdocs_user_id })
				);
			} else if (!skipGenerateOnFail) {
				userStorage.clear();
				dispatch(generateUserAsync());
			}

			return response.data;
		} catch (error) {
			if (!skipGenerateOnFail) {
				userStorage.clear();
				dispatch(generateUserAsync());
			}
			return rejectWithValue(handleApiError(error));
		}
	}
);

// Async thunk for getting user credits
export const getCreditsAsync = createAsyncThunk(
	"user/getCredits",
	async ({ zoomdocs_auth_id, zoomdocs_user_id }, { rejectWithValue }) => {
		try {
			const response = await getCredits(
				zoomdocs_auth_id,
				zoomdocs_user_id
			);
			return response.data;
		} catch (error) {
			return rejectWithValue(handleApiError(error));
		}
	}
);

// Initial state with localStorage data
const getInitialState = () => {
	const storedData = userStorage.get();
	return {
		zoomdocs_auth_id: storedData.zoomdocs_auth_id || null,
		zoomdocs_user_id: storedData.zoomdocs_user_id || null,
		credits: null,
		isLoading: false,
		error: null,
		isInitialized: false,
		loadingStates: {
			generating: false,
			checking: false,
			starting: false,
			fetchingCredits: false,
		},
	};
};

const userSlice = createSlice({
	name: "user",
	initialState: getInitialState(),
	reducers: {
		clearUser: (state) => {
			state.zoomdocs_auth_id = null;
			state.zoomdocs_user_id = null;
			state.credits = null;
			state.error = null;
			state.isInitialized = false;
			state.loadingStates = {
				generating: false,
				checking: false,
				starting: false,
				fetchingCredits: false,
			};
			userStorage.clear();
		},
		clearError: (state) => {
			state.error = null;
		},
		setInitialized: (state, action) => {
			state.isInitialized = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			// Generate User cases
			.addCase(generateUserAsync.pending, (state) => {
				state.isLoading = true;
				state.loadingStates.generating = true;
				state.error = null;
			})
			.addCase(generateUserAsync.fulfilled, (state, action) => {
				state.isLoading = false;
				state.loadingStates.generating = false;
				state.zoomdocs_auth_id = action.payload.zoomdocs_auth_id;
				state.zoomdocs_user_id = action.payload.zoomdocs_user_id;
				state.isInitialized = true;
				state.error = null;
			})
			.addCase(generateUserAsync.rejected, (state, action) => {
				state.isLoading = false;
				state.loadingStates.generating = false;
				state.error = action.payload;
				state.isInitialized = true;
			})

			// Check User cases
			.addCase(checkUserAsync.pending, (state) => {
				state.isLoading = true;
				state.loadingStates.checking = true;
				state.error = null;
			})
			.addCase(checkUserAsync.fulfilled, (state, action) => {
				state.isLoading = false;
				state.loadingStates.checking = false;
				state.error = null;

				if (action.payload.status === false) {
					state.zoomdocs_auth_id = null;
					state.zoomdocs_user_id = null;
					state.credits = null;
					state.isInitialized = false;
				} else {
					state.isInitialized = true;
				}
			})
			.addCase(checkUserAsync.rejected, (state, action) => {
				state.isLoading = false;
				state.loadingStates.checking = false;
				state.error = action.payload;
				state.isInitialized = true;
			})

			// Start User cases
			.addCase(startUserAsync.pending, (state) => {
				state.isLoading = true;
				state.loadingStates.starting = true;
				state.error = null;
			})
			.addCase(startUserAsync.fulfilled, (state, action) => {
				state.isLoading = false;
				state.loadingStates.starting = false;
				state.error = null;

				if (action.payload.status === false) {
					state.zoomdocs_auth_id = null;
					state.zoomdocs_user_id = null;
					state.credits = null;
					state.isInitialized = false;
				}
			})
			.addCase(startUserAsync.rejected, (state, action) => {
				state.isLoading = false;
				state.loadingStates.starting = false;
				state.error = action.payload;
			})

			// Get Credits cases
			.addCase(getCreditsAsync.pending, (state) => {
				state.isLoading = true;
				state.loadingStates.fetchingCredits = true;
				state.error = null;
			})
			.addCase(getCreditsAsync.fulfilled, (state, action) => {
				state.isLoading = false;
				state.loadingStates.fetchingCredits = false;
				state.credits = action.payload;
				state.error = null;
			})
			.addCase(getCreditsAsync.rejected, (state, action) => {
				state.isLoading = false;
				state.loadingStates.fetchingCredits = false;
				state.error = action.payload;
			});
	},
});

export const { clearUser, clearError, setInitialized } = userSlice.actions;
export default userSlice.reducer;
