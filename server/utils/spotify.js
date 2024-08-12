const axios = require('axios');
require('dotenv').config();

const spotifyAxios = axios.create({
	baseURL: process.env.SPOTIFY_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

const refreshAccessToken = async refreshToken => {
	try {
		const { data } = await axios.post(
			'https://accounts.spotify.com/api/token',
			new URLSearchParams({
				grant_type: 'refresh_token',
				refresh_token: refreshToken,
			}),
			{
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
					Authorization:
						'Basic ' +
						new Buffer.from(
							process.env.SPOTIFY_CLIENT_ID +
								':' +
								process.env.SPOTIFY_CLIENT_SECRET
						).toString('base64'),
				},
			}
		);

		return {
			newAccessToken: data.access_token,
			expiresIn: data.expires_in,
		};
	} catch (error) {
		throw new Error(error);
	}
};

const spotifyAudioAnalysis = async (trackId, accessToken) => {
	try {
		let { data } = await spotifyAxios.get(`/audio-analysis/${trackId}`, {
			headers: {
				Authorization: 'Bearer ' + accessToken,
			},
		});

		return data;
	} catch (error) {
		console.log(error);
	}
};

const searchSpotify = async (term, type, accessToken) => {
	try {
		let { data } = await spotifyAxios.get('/search', {
			params: { q: term, type: type },
			headers: {
				Authorization: 'Bearer ' + accessToken,
			},
		});

		return data;
	} catch (error) {
		throw new Error(
			error.response
				? error.response.data.error.message
				: 'Failed to search Spotify'
		);
	}
};

const spotifyPlay = async (body, spotifyAccessToken) => {
	try {
		let { status } = await spotifyAxios.put(
			'/me/player/play',
			{
				uris: body.uris,
				context_uri: body.context_uri,
				device_id: body.device_id,
				position_ms: body.position_ms,
			},
			{
				headers: {
					Authorization: `Bearer ${spotifyAccessToken}`,
				},
			}
		);

		if (status !== 202) {
			return { playbackStarted: false };
		}

		return { playbackStarted: true };
	} catch (error) {
		throw new Error(
			error.response
				? error.response.data.error.message
				: 'Failed to start playback'
		);
	}
};

const getPlaybackState = async spotifyAccessToken => {
	try {
		const response = await spotifyAxios.get('/me/player', {
			headers: {
				Authorization: `Bearer ${spotifyAccessToken}`,
			},
		});

		if (response.status !== 200) {
			throw new Error('Error getting playback state');
		}
		return { playbackState: response.data };
	} catch (error) {
		throw new Error(
			error.response
				? error.response.data.error.message
				: 'Failed to get playback state'
		);
	}
};

const setSpotifyDevice = async (device_id, spotifyAccessToken) => {
	try {
		console.log(`Attempting to set device with ID: ${device_id}`);
		console.log(`Using Access Token: ${spotifyAccessToken}`);

		const { status } = await spotifyAxios.put(
			'/me/player',
			{
				device_ids: [device_id],
				play: false,
			},
			{
				headers: {
					Authorization: `Bearer ${spotifyAccessToken}`,
				},
			}
		);

		if (status !== 204) {
			console.error(`Failed to set device. Status: ${status}`);
			return { deviceSet: false };
		}

		console.log('Device set successfully.');
		return { deviceSet: true };
	} catch (error) {
		// Log the full error response for debugging
		console.error(
			'Error details:',
			error.response ? error.response.data : error.message
		);
		throw new Error(
			error.response
				? error.response.data.error.message
				: 'Failed to set device'
		);
	}
};

module.exports = {
	refreshAccessToken,
	searchSpotify,
	spotifyPlay,
	setSpotifyDevice,
	getPlaybackState,
	spotifyAudioAnalysis,
};
