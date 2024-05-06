const router = require('express').Router();
const { searchTracks } = require('../../controllers/spotifyController');
const isAuthenticated = require('../../middleware/authentication/');
const hasSpotifyLinkedService = require('../../middleware/services/spotify');

router
	.route('/search')
	.get(isAuthenticated, hasSpotifyLinkedService, searchTracks);

module.exports = router;
