const SpotifyStrategy = require('passport-spotify').Strategy;
require('dotenv').config();

module.exports = new SpotifyStrategy(
	{
		clientID: process.env.SPOTIFY_CLIENT_ID,
		clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
		callbackURL: process.env.SPOTIFY_CALLBACK_URL,
	},
	async function (accessToken, refreshToken, expires_in, profile, done) {
		try {
			return done(null, profile);
		} catch (error) {
			console.error(error);
			return done(error);
		}
	}
);
