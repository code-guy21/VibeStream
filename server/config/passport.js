const passport = require('passport');
const setupSpotifyStrategy = require('./strategies/spotifyStrategy');

passport.serializeUser(function (user, done) {
	return done(null, user);
});
passport.deserializeUser(function (obj, done) {
	return done(null, obj);
});
passport.use(setupSpotifyStrategy);
