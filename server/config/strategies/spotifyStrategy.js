const SpotifyStrategy = require('passport-spotify').Strategy;
require('dotenv').config();

module.exports = function (passport) {
	passport.use(
		new SpotifyStrategy(
			{
				clientID: process.env.SPOTIFY_CLIENT_ID,
				clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
				callbackURL: process.env.SPOTIFY_CALLBACK_URL,
			},
			function (accessToken, refreshToken, expires_in, profile, done) {
				process.nextTick(function () {
					// To keep the example simple, the user's spotify profile is returned to
					// represent the logged-in user. In a typical application, you would want
					// to associate the spotify account with a user record in your database,
					// and return that user instead.
					console.log(profile);
					return done(null, profile);
				});
			}
		)
	);
};
