const router = require('express').Router();
const {
	searchTracks,
	getAccessToken,
	playTrack,
	setDevice,
} = require('../../controllers/spotifyController');
const isAuthenticated = require('../../middleware/authentication/');
const hasSpotifyLinkedService = require('../../middleware/services/spotify');

router
	.route('/search')
	.get(isAuthenticated, hasSpotifyLinkedService, searchTracks);

router.route('/play').post(isAuthenticated, hasSpotifyLinkedService, playTrack);

router.route('/set').post(isAuthenticated, hasSpotifyLinkedService, setDevice);

router
	.route('/token')
	.get(isAuthenticated, hasSpotifyLinkedService, getAccessToken);

module.exports = router;
