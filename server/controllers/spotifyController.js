const {
	searchSpotify,
	spotifyPlay,
	setSpotifyDevice,
} = require('../utils/spotify');

module.exports = {
	searchTracks: async ({ query, spotifyAccessToken }, res) => {
		try {
			if (!query.term || !query.type) {
				return res
					.status(400)
					.json({ message: 'Search term and type are required' });
			}

			let tracks = await searchSpotify(
				query.term,
				query.type,
				spotifyAccessToken
			);

			console.log(tracks);

			res.status(200).json(tracks);
		} catch (error) {
			console.error(error);
			const status = error.response ? error.response.status : 500;
			const message = error.response
				? error.response.data.error.message
				: 'Failed to process your request';
			res.status(status).json({ message });
		}
	},
	getAccessToken: ({ spotifyAccessToken }, res) => {
		res.json({ token: spotifyAccessToken });
	},
	playTrack: async ({ body, spotifyAccessToken }, res) => {
		try {
			let { playbackStarted } = await spotifyPlay(body, spotifyAccessToken);

			if (!playbackStarted) {
				return res.status(400).json({ message: 'Failed to start playback' });
			}

			res.status(200).json({ message: 'Track playback started' });
		} catch (error) {
			console.log(error);
			res.status(500).json({ message: error.message });
		}
	},
	setDevice: async ({ body, spotifyAccessToken }, res) => {
		try {
			const { deviceSet } = await setSpotifyDevice(
				body.device_id,
				spotifyAccessToken
			);

			if (!deviceSet) {
				res.status(400).json({ message: 'Failed to set device' });
			}

			res
				.status(200)
				.json({ message: `device ${body.device_id} set as active` });
		} catch (error) {
			console.log(error);
			res.status(500).json({ message: error.message });
		}
	},
};
