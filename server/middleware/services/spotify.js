const { refreshAccessToken } = require('../../utils/spotify');

const hasSpotifyLinkedService = async (req, res, next) => {
	const spotifyService = req.user.linkedServices?.find(
		service => service.serviceName === 'spotify'
	);

	if (
		!spotifyService ||
		!spotifyService.accessToken ||
		!spotifyService.refreshToken
	) {
		return res.status(401).json({
			message:
				'Spotify service not linked or access and refresh tokens missing',
		});
	}

	if (new Date(spotifyService.expirationDate) < new Date()) {
		try {
			let { newAccessToken, expiresIn } = await refreshAccessToken(
				spotifyService.refreshToken
			);

			spotifyService.accessToken = newAccessToken;
			spotifyService.expirationDate = new Date(Date.now() + expiresIn * 1000);
			await req.user.save();
		} catch (error) {
			return res.status(400).json({ message: error.message });
		}
	}

	req.spotifyAccessToken = spotifyService.accessToken;
	req.tokenExpiration = spotifyService.expirationDate;

	next();
};

module.exports = hasSpotifyLinkedService;
