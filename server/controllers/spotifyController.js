const {
	searchSpotify,
	spotifyPlay,
	setSpotifyDevice,
	getPlaybackState,
} = require('../utils/spotify');

module.exports = {
	search: async ({ query, spotifyAccessToken }, res) => {
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

			res.status(200).json({ data, accessToken: spotifyAccessToken });
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
			});
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

			res.status(200).json({
				message: `device ${body.device_id} set as active`,
				accessToken: spotifyAccessToken,
			});
		} catch (error) {
			console.log(error);
			res.status(500).json({ message: error.message });
		}
	},
};
