const passport = require('passport');
const setupGoogleStrategy = require('./strategies/googleStrategy');
const setupLocalStrategy = require('./strategies/localStrategy');

passport.use(setupGoogleStrategy);
passport.use(setupLocalStrategy);

passport.serializeUser(function (user, done) {
	return done(null, user);
});
passport.deserializeUser(function (obj, done) {
	return done(null, obj);
});
