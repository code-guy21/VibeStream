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
				return done(null, false, { message: 'User not logged in' });
			}

			let linkedServiceIndex = req.user.linkedServices.findIndex(service => {
				return service.serviceName === SERVICES.SPOTIFY;
			});

			if (linkedServiceIndex > -1) {
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

			return done(null, req.user);
		} catch (error) {
			console.log(error);
			return done(error, null);
		}
	}
);
