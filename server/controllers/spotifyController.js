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
};
