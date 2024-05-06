function hasSpotifyLinkedService(req, res, next) {
	const spotifyService = req.user.linkedServices?.find(
		service => service.serviceName === 'spotify'
	);

	if (!spotifyService || !spotifyService.accessToken) {
		return res
			.status(401)
			.json({ message: 'Spotify service not linked or access token missing' });
	}

	req.spotifyAccessToken = spotifyService.accessToken;
	next();
}

module.exports = hasSpotifyLinkedService;
