const setupSpotifyStrategy = require('./strategies/spotifyStrategy');

module.exports = function (passport) {
	passport.serializeUser(function (user, done) {
		return done(null, user);
	});
	passport.deserializeUser(function (obj, done) {
		return done(null, obj);
	});
	setupSpotifyStrategy(passport);
};
