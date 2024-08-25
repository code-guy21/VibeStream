const {
	searchSpotify,
	spotifyPlay,
	setSpotifyDevice,
	getPlaybackState,
	spotifyAudioAnalysis,
} = require('../utils/spotify');

module.exports = {
	search: async ({ query, spotifyAccessToken, tokenExpiration }, res) => {
		try {
			if (!query.term || !query.type) {
				return res
					.status(400)
					.json({ message: 'Search term and type are required' });
			}

			let data = await searchSpotify(
				query.term,
				query.type,
				spotifyAccessToken
			);

			res
				.status(200)
				.json({ data, accessToken: spotifyAccessToken, tokenExpiration });
		} catch (error) {
			console.error(error);
			const status = error.response ? error.response.status : 500;
			const message = error.response
				? error.response.data.error.message
				: 'Failed to process your request';
			res.status(status).json({ message });
		}
	},
	getAccessToken: ({ spotifyAccessToken, tokenExpiration }, res) => {
		res.json({ token: spotifyAccessToken, tokenExpiration });
	},
	playTrack: async ({ body, spotifyAccessToken, tokenExpiration }, res) => {
		try {
			let response;

			if (body.togglePlayback) {
				response = await spotifyPlay(body, spotifyAccessToken);
			} else {
				let { playbackState } = await getPlaybackState(spotifyAccessToken);

				let context = playbackState.context ? playbackState.context.uri : null;

				if (playbackState) {
					response = await spotifyPlay(
						{
							context_uri: context,
							device_id: playbackState?.device?.id,
							uris: context ? null : [playbackState.item?.uri],
							position_ms: playbackState.progress_ms,
						},
						spotifyAccessToken
					);
				}
			}

			if (!response.playbackStarted) {
				return res.status(400).json({ message: 'Failed to start playback' });
			}

			res.status(200).json({
				message: 'Track playback started',
				accessToken: spotifyAccessToken,
				tokenExpiration,
			});
		} catch (error) {
			console.log(error);
			res.status(500).json({ message: error.message });
		}
	},
	getAudioAnalysis: async ({ query, spotifyAccessToken }, res) => {
		try {
			let analysis = await spotifyAudioAnalysis(query.id, spotifyAccessToken);

			res.json(analysis);
		} catch (error) {
			console.log(error);
		}
	},
	setDevice: async ({ body, spotifyAccessToken, tokenExpiration }, res) => {
		try {
			console.log(body, spotifyAccessToken, tokenExpiration);
			const { deviceSet } = await setSpotifyDevice(
				body.device_id,
				spotifyAccessToken
			);

			if (!deviceSet) {
				res.status(400).json({ message: 'Failed to set device' });
			} else {
				res.status(200).json({
					message: `Device ${body.device_id} set as active`,
					accessToken: spotifyAccessToken,
					tokenExpiration,
				});
			}
		} catch (error) {
			console.log(error);
			res.status(500).json({ message: error.message });
		}
	},
};
