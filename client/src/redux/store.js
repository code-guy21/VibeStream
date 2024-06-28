import { configureStore } from '@reduxjs/toolkit';
import playBackReducer from './reducers/playbackSlice';
import userReducer from './reducers/userSlice';
import { logoutMiddleware } from './middleware';

export const store = configureStore({
	reducer: {
		playback: playBackReducer,
		user: userReducer,
	},
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware().concat(logoutMiddleware),
});
