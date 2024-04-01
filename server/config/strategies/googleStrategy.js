const { User, Auth } = require('../../models');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

module.exports = new GoogleStrategy(
	{
		clientID: process.env.GOOGLE_CLIENT_ID,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		callbackURL: process.env.GOOGLE_CALLBACK_URL,
	},
	async function (accessToken, refreshToken, params, profile, done) {
		try {
			let callbackData = {
				accessToken,
				refreshToken,
				expires_in: params.expires_in,
				profile: {
					id: profile.id,
					displayName: profile.displayName,
					email: profile.emails[0].value,
					profileImage: profile.photos[0].value,
					provider: profile.provider,
				},
			};
			let user = await authenticateUser(callbackData);
			return done(null, user);
		} catch (error) {
			console.error(error);
			return done(error);
		}
	}
);

async function authenticateUser(callbackData) {
	try {
		const {
			accessToken,
			refreshToken,
			expires_in,
			profile: { id, email, displayName, profileImage, provider },
		} = callbackData;

		let user = await User.findOne({ email }).populate({
			path: 'authMethods',
		});

		if (!user) {
			user = await User.create({
				username: id,
				displayName,
				email,
				profileImage,
			});

			user.authMethods.push({
				authProvider: provider,
				providerId: id,
				accessToken,
				refreshToken,
				expirationDate: new Date(Date.now() + expires_in * 1000),
			});
		} else {
			let authIndex = user.authMethods.findIndex(
				method => method.authProvider === provider
			);

			if (authIndex > -1) {
				user.authMethods[authIndex].accessToken = accessToken;
				user.authMethods[authIndex].refreshToken = refreshToken;
				user.authMethods[authIndex].expirationDate = new Date(
					Date.now() + expires_in * 1000
				);
			} else {
				user.authMethods.push({
					authProvider: provider,
					providerId: id,
					accessToken,
					refreshToken,
					expirationDate: new Date(Date.now() + expires_in * 1000),
				});
			}
		}

		await user.save();

		return user;
	} catch (error) {
		console.error(error);
		throw error;
	}
}
