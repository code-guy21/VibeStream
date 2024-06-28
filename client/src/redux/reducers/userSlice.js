import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAuthStatus } from '../../api/user';

export const fetchAuthStatus = createAsyncThunk(
	'/user/fetchAuthStatus',
	async (_, thunkAPI) => {
		try {
			const response = await getAuthStatus();
			const userData = await response.json();

			return userData;
		} catch (error) {
			thunkAPI.rejectWithValue(error.message);
		}
	}
);

const initialState = {
	loading: true,
	loggedIn: false,
	user: null,
};

const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		loginUser: (state, action) => {
			state.loggedIn = action.payload.loggedIn;
			state.user = action.payload.user;
		},
		logoutUser: (state, action) => {
			state.loggedIn = false;
			state.user = null;
		},
	},
	extraReducers: builder => {
		builder.addCase(fetchAuthStatus.fulfilled, (state, action) => {
			state.loading = false;
			state.loggedIn = action.payload.loggedIn;
			state.user = action.payload.user;
		});
	},
});

export const { loginUser, logoutUser } = userSlice.actions;

export default userSlice.reducer;
