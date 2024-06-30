const axios = require('axios');

const refreshAccessToken = async refreshToken => {
	try {
		const { data } = await axios.post(
			'https://accounts.spotify.com/api/token',
			new URLSearchParams({
				grant_type: 'refresh_token',
				refresh_token: refreshToken,
			}),
			{
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
					Authorization:
						'Basic ' +
						new Buffer.from(
							process.env.SPOTIFY_CLIENT_ID +
								':' +
								process.env.SPOTIFY_CLIENT_SECRET
						).toString('base64'),
				},
			}
		);

		return {
			newAccessToken: data.access_token,
			expiresIn: data.expires_in,
		};
	} catch (error) {
		throw new Error(error);
	}
};

module.exports = refreshAccessToken;
