const router = require('express').Router();
const passport = require('passport');
const {
	googleCallback,
	registerUser,
} = require('../../controllers/authController');

router.route('/google').get(
	passport.authenticate('google', {
		scope: ['profile', 'email'],
		accessType: 'offline',
		prompt: 'select_account',
	})
);

router
	.route('/google/callback')
	.get(
		passport.authenticate('google', { failureRedirect: '/login' }),
		googleCallback
	);

router.route('/register').post(registerUser);

module.exports = router;
