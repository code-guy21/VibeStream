const router = require('express').Router();
const passport = require('passport');
const { spotifyCallback } = require('../../controllers/authController');

router.route('/spotify').get(
	passport.authenticate('spotify', {
		scope: ['user-read-email', 'user-read-private'],
		showDialog: true,
	})
);

router
	.route(
		'/spotify/callback',
		passport.authenticate('spotify', { failureRedirect: '/login' })
	)
	.get(spotifyCallback);

module.exports = router;
