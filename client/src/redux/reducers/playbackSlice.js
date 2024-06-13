import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	searchTerm: '',
	trackList: [],
	currentTrack: {},
	accessToken: '',
	deviceID: '',
	isPaused: true,
	isActive: false,
};

export const playBackSlice = createSlice({
	name: 'playback',
	initialState,
	reducers: {
		setSearchTerm: (state, action) => {
			state.searchTerm = action.payload;
		},
		setTrackList: (state, action) => {
			state.trackList = [...action.payload];
		},
		setCurrentTrack: (state, action) => {
			state.currentTrack = action.payload;
		},
		setAccessToken: (state, action) => {
			state.accessToken = action.payload;
		},
		setDeviceID: (state, action) => {
			state.deviceID = action.payload;
		},
		setPaused: (state, action) => {
			state.isPaused = action.payload;
		},
		setActive: (state, action) => {
			state.isActive = action.payload;
		},
	},
});

export const {
	setSearchTerm,
	setTrackList,
	setCurrentTrack,
	setAccessToken,
	setDeviceID,
	setPaused,
	setActive,
} = playBackSlice.actions;

export default playBackSlice.reducer;
