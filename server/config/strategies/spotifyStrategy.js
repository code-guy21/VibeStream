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
			let callbackData = { accessToken, refreshToken, expires_in, profile };
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
			profile: { username, emails, displayName, photos, provider },
		} = callbackData;

		let user = await User.findOne({
			email: emails[0].value,
		}).populate({
			path: 'authMethods',
		});

		if (!user) {
			user = await User.create({
				username: username,
				displayName: displayName,
				email: emails[0].value,
				profileImage: photos[0].value,
			});

			let newAuthMethod = await createAuthMethod(callbackData);

			user.authMethods.push(newAuthMethod);
		} else {
			let authIndex = user.authMethods.findIndex(
				method => method.authProvider === provider
			);

			if (authIndex > -1) {
				let authMethod = user.authMethods[authIndex];
				await updateAuthMethod(authMethod, callbackData);
			} else {
				let newAuthMethod = await createAuthMethod(callbackData);

				user.authMethods.push(newAuthMethod);
			}
		}

		await user.save();

		return user;
	} catch (error) {
		console.error(error);
		throw error;
	}
}

async function createAuthMethod(callbackData) {
	try {
		const {
			accessToken,
			refreshToken,
			expires_in,
			profile: { provider, id, profileUrl },
		} = callbackData;

		let newAuthMethod = await Auth.create({
			authProvider: provider,
			profileId: id,
			encryptedAuthToken: accessToken,
			encryptedRefreshToken: refreshToken,
			expirationDate: new Date(Date.now() + expires_in * 1000),
			profileLink: profileUrl,
		});
		return newAuthMethod;
	} catch (error) {
		console.error(error);
		throw error;
	}
}

async function updateAuthMethod(authMethod, callbackData) {
	try {
		const { accessToken, refreshToken, expires_in } = callbackData;
		authMethod.encryptedAuthToken = accessToken;
		authMethod.encryptedRefreshToken = refreshToken;
		authMethod.expirationDate = new Date(Date.now() + expires_in * 1000);
		await authMethod.save();
	} catch (error) {
		console.error(error);
		throw error;
	}
}
