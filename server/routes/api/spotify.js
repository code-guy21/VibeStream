const router = require('express').Router();
const {
	searchTracks,
	getAccessToken,
} = require('../../controllers/spotifyController');
const isAuthenticated = require('../../middleware/authentication/');
const hasSpotifyLinkedService = require('../../middleware/services/spotify');

router
	.route('/search')
	.get(isAuthenticated, hasSpotifyLinkedService, searchTracks);

router
	.route('/token')
	.get(isAuthenticated, hasSpotifyLinkedService, getAccessToken);

module.exports = router;
