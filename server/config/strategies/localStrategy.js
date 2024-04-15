const LocalStrategy = require('passport-local').Strategy;

module.exports = new LocalStrategy(
	{
		usernameField: 'email',
		passwordField: 'password',
	},
	async function (email, password, done) {
		try {
			return done(null, { email, password });
		} catch (error) {
			return done(error, null);
		}
	}
);
