const mongoose = require('mongoose');
const request = require('supertest');
const {
	refreshAccessToken,
	getPlaybackState,
} = require('../../../utils/spotify');
require('dotenv').config();

let accessToken;
let app;
let server;

const setAccessToken = token => {
	accessToken = token;
};

const getAccessToken = () => {
	return accessToken;
};

// Setup the mock before importing the app
jest.mock('../../../middleware/authentication', () =>
	jest.fn((req, res, next) => next())
);

jest.mock('../../../middleware/services/spotify.js', () => {
	return jest.fn((req, res, next) => {
		req.spotifyAccessToken = getAccessToken();
		next();
	});
});

beforeAll(async () => {
	try {
		const { newAccessToken } = await refreshAccessToken(
			process.env.SPOTIFY_REFRESH_TOKEN
		);

		setAccessToken(newAccessToken);

		app = require('../../../app');
		server = app.listen(0);
	} catch (error) {
		console.error(
			'Setup failed:',
			error.response ? error.response.data : error
		);
		throw new Error('Failed to setup test environment');
	}
});

afterAll(async () => {
	await mongoose.connection.close();

	// Close the MongoStore connection
	if (app.sessionStore && app.sessionStore.close) {
		await app.sessionStore.close();
	}

	// Shut down the server
	if (server) {
		server.close();
	}
});

beforeEach(async () => {
	jest.clearAllMocks();
});

describe('Spotify Track Search', () => {
	it('should return a track list from Spotify API', async () => {
		let {
			body: { data, accessToken },
		} = await request(app)
			.get(`/api/spotify/search`)
			.query({ term: 'Purple Rain', type: 'track' })
			.set('Accept', 'application/json')
			.expect(200);

		expect(data.tracks.items.length).toBeGreaterThan(0);
		expect(data.tracks.items[0]).toHaveProperty('name');
		expect(data.tracks.items[0].type).toBe('track');
		expect(data.tracks.items[0].name).toBe('Purple Rain');
		expect(accessToken).toBeDefined();
	});
});
