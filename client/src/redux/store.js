import { configureStore } from '@reduxjs/toolkit';
import playBackReducer from './reducers/playbackSlice';
import userReducer from './reducers/userSlice';

export const store = configureStore({
	reducer: {
		playback: playBackReducer,
		user: userReducer,
	},
});
