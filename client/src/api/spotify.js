import { store } from '../redux/store';
import { logoutUser } from '../redux/reducers/userSlice';

const customFetch = async (url, options) => {
	try {
		const response = await fetch(url, options);
		if (response.status === 401) {
			store.dispatch(logoutUser());
		}
		return response;
	} catch (error) {
		console.error('Fetch error:', error);
		throw error;
	}
};

export const playTrack = (deviceID, uri, togglePlayback, type) =>
	customFetch('/api/spotify/play', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			uris: uri ? [uri] : null,
			device_id: deviceID ? deviceID : null,
			togglePlayback,
		}),
	});

export const setDeviceAsActive = device_id =>
	customFetch('/api/spotify/set', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ device_id }),
	});

export const searchTracks = term =>
	customFetch(`/api/spotify/search?term=${term}&type=track`);

export const fetchToken = () => customFetch('/api/spotify/token');
