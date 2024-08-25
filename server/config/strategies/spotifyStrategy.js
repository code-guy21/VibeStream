const SpotifyStrategy = require('passport-spotify').Strategy;
const { User } = require('../../models');
const { SERVICES } = require('../../utils/constants');
require('dotenv').config();

module.exports = new SpotifyStrategy(
	{
		clientID: process.env.SPOTIFY_CLIENT_ID,
		clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
		callbackURL: process.env.SPOTIFY_CALLBACK_URL,
		passReqToCallback: true,
	},
	async function (req, accessToken, refreshToken, expires_in, profile, done) {
		try {
			if (!req.user) {
				console.log('User not logged in during Spotify authentication');
				return done(null, false, { message: 'User not logged in' });
			}

			console.log('Spotify Profile:', JSON.stringify(profile, null, 2));
			console.log('Access Token:', accessToken);
			console.log('Refresh Token:', refreshToken);
			console.log('Token Expiry:', new Date(Date.now() + expires_in * 1000));

			let linkedServiceIndex = req.user.linkedServices.findIndex(service => {
				return service.serviceName === SERVICES.SPOTIFY;
			});

			if (linkedServiceIndex > -1) {
				console.log('Spotify service already linked for user:', req.user.email);
				return done(null, false, { message: 'Spotify service already linked' });
			}

			req.user.linkedServices.push({
				serviceName: SERVICES.SPOTIFY,
				profileId: profile.id,
				accessToken: accessToken,
				refreshToken: refreshToken,
				expirationDate: new Date(Date.now() + expires_in * 1000),
			});

			await req.user.save();

			console.log(`User ${req.user.email} linked to Spotify successfully`);
			return done(null, req.user);
		} catch (error) {
			console.error('Error in Spotify Strategy:', error.message, {
				stack: error.stack,
				profileData: profile,
				accessToken,
				refreshToken,
				user: req.user ? req.user.email : 'No user',
			});
			return done(error, null);
		}
	}
);
