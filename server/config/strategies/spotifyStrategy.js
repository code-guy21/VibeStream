const { User, Auth } = require('../../models');
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
			let user = await User.findOne({
				email: profile.emails[0].value,
			}).populate({
				path: 'authMethods',
				match: { authProvider: profile.provider },
			});

			if (!user) {
				user = await User.create({
					username: profile.username,
					displayName: profile.displayName,
					email: profile.emails[0].value,
					profileImage: profile.photos[0].value,
				});

				let newAuthMethod = await Auth.create({
					authProvider: profile.provider,
					profileId: profile.id,
					encryptedAuthToken: accessToken,
					encryptedRefreshToken: refreshToken,
					expirationDate: new Date(Date.now() + expires_in * 1000),
					profileLink: profile.profileUrl,
				});

				user.authMethods.push(newAuthMethod);
			} else {
				let authMethod = await Auth.findOne({ _id: user.authMethods[0]._id });
				authMethod.encryptedAuthToken = accessToken;
				authMethod.encryptedRefreshToken = refreshToken;
				authMethod.expirationDate = new Date(Date.now() + expires_in * 1000);

				await authMethod.save();
			}

			await user.save();

			return done(null, user);
		} catch (error) {
			console.error(error);
			return done(error);
		}
	}
);
