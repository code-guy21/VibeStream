import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	loggedIn: false,
};

const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		loginUser: (state, action) => {
			state.loggedIn = true;
		},
	},
});

export const { loginUser } = userSlice.actions;

export default userSlice.reducer;
