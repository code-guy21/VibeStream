const axios = require('axios');
require('dotenv').config();

module.exports = {
	searchTracks: async (req, res) => {
		try {
			if (!req.query.term || !req.query.type) {
				return res
					.status(400)
					.json({ message: 'Search term and type are required' });
			}

			const baseURL = new URL(process.env.SPOTIFY_BASE_URL);

			baseURL.search = new URLSearchParams({
				q: req.query.term,
				type: req.query.type,
			});

			const headers = {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + req.spotifyAccessToken,
			};

			let response = await axios.get(baseURL.toString(), { headers });

			res.status(200).json(response.data);
		} catch (error) {
			console.error(error);
			const status = error.response ? error.response.status : 500;
			const message = error.response
				? error.response.data.error.message
				: 'Failed to process your request';
			res.status(status).json({ message });
		}
	},
	getAccessToken: (req, res) => {
		res.json({ token: req.spotifyAccessToken });
	},
	playTrack: async (req, res) => {
		try {
			let response = await axios.put(
				'https://api.spotify.com/v1/me/player/play',
				{
					...(req.body.uris && { uris: req.body.uris }),
					...(req.body.context_uri && { context_uri: req.body.context_uri }),
					...(req.body.device_id && { device_id: req.body.device_id }),
				},
				{
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${req.spotifyAccessToken}`,
					},
				}
			);

			if (response.status !== 202) {
				return res.status(400).json({ message: 'Failed to start playback' });
			}

			res.status(200).json({ message: 'Track playback started' });
		} catch (error) {
			console.log(error);
			res.status(500).json({ message: error.message });
		}
	},
	setDevice: async (req, res) => {
		try {
			const response = await axios.put(
				'https://api.spotify.com/v1/me/player',
				{
					device_ids: [req.body.device_id],
					play: false,
				},
				{
					headers: {
						Authorization: `Bearer ${req.spotifyAccessToken}`,
						'Content-Type': 'application/json',
					},
				}
			);

			if (response.status !== 204) {
				res.status(400).json({ message: 'Failed to set device' });
			}

			res
				.status(200)
				.json({ message: `device ${req.body.device_id} set as active` });
		} catch (error) {
			console.log(error);
			res.status(500).json({ message: error.message });
		}
	},
};
