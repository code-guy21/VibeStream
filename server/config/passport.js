const passport = require('passport');
const setupGoogleStrategy = require('./strategies/googleStrategy');

passport.serializeUser(function (user, done) {
	return done(null, user);
});
passport.deserializeUser(function (obj, done) {
	return done(null, obj);
});
passport.use(setupGoogleStrategy);
