const axios = require('axios');
const mongoose = require('mongoose');
const request = require('supertest');
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
		const baseURL = new URL('https://accounts.spotify.com/api/token');
		const searchParams = new URLSearchParams({
			grant_type: 'refresh_token',
			refresh_token: process.env.SPOTIFY_REFRESH_TOKEN,
		});
		const headers = {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Basic ${Buffer.from(
				process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
			).toString('base64')}`,
		};

		const response = await axios.post(baseURL.toString(), searchParams, {
			headers,
		});

		setAccessToken(response.data.access_token);

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
		let response = await request(app)
			.get(`/api/spotify/search`)
			.query({ term: 'Purple Rain', type: 'track' })
			.set('Accept', 'application/json')
			.expect(200);

		expect(response.body.tracks.items.length).toBeGreaterThan(0);
		expect(response.body.tracks.items[0]).toHaveProperty('name');
		expect(response.body.tracks.items[0].type).toBe('track');
		expect(response.body.tracks.items[0].name).toBe('Purple Rain');
	});
});
