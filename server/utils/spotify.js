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

const searchSpotify = async (term, type, accessToken) => {
	try {
		let response = await spotifyAxios.get('/search', {
			params: { q: term, type: type },
			headers: {
				Authorization: 'Bearer ' + accessToken,
			},
		});

		return response.data;
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
				...(body.uris && { uris: body.uris }),
				...(body.context_uri && { context_uri: body.context_uri }),
				...(body.device_id && { device_id: body.device_id }),
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

const setSpotifyDevice = async (device_id, spotifyAccessToken) => {
	try {
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
			return { deviceSet: false };
		}

		return { deviceSet: true };
	} catch (error) {
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
};
