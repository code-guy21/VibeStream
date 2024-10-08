const router = require('express').Router();
const {
	search,
	getAccessToken,
	playTrack,
	setDevice,
	getAudioAnalysis,
} = require('../../controllers/spotifyController');
const isAuthenticated = require('../../middleware/authentication/');
const hasSpotifyLinkedService = require('../../middleware/services/spotify');

router.route('/search').get(isAuthenticated, hasSpotifyLinkedService, search);

router.route('/play').post(isAuthenticated, hasSpotifyLinkedService, playTrack);

router.route('/set').post(isAuthenticated, hasSpotifyLinkedService, setDevice);

router
	.route('/audio')
	.get(isAuthenticated, hasSpotifyLinkedService, getAudioAnalysis);

router
	.route('/token')
	.get(isAuthenticated, hasSpotifyLinkedService, getAccessToken);

module.exports = router;
