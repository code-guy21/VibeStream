const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { User } = require('../../../models');
const { refreshAccessToken } = require('../../../utils/spotify');

let mongoServer;
let app;
let server;

// Set up and tear down of the MongoDB in-memory server
beforeAll(async () => {
	try {
		mongoServer = await MongoMemoryServer.create();
		const mongoUri = mongoServer.getUri();
		process.env.MONGODB_URI = mongoUri;

		await mongoose.connect(mongoUri, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});

		app = require('../../../app');
		server = app.listen(0);
		await new Promise(resolve => server.once('listening', resolve));
	} catch (err) {
		console.error('Failed to set up MongoDB in-memory server', err);
	}
});

afterAll(async () => {
	try {
		await mongoose.connection.close();
		if (app.sessionStore && app.sessionStore.close) {
			await app.sessionStore.close();
		}
		await mongoServer.stop();
		server.close();
	} catch (err) {
		console.error('Failed to tear down MongoDB in-memory server', err);
	}
});

beforeEach(async () => {
	await User.deleteMany({});
	jest.clearAllMocks();
});

// Mock Passport Spotify OAuth Strategy
jest.mock('passport-spotify', () => {
	const originalModule = jest.requireActual('passport-spotify');
	return {
		...originalModule,
		Strategy: jest.fn().mockImplementation((options, verify) => ({
			name: 'spotify',
			authenticate: function (req, options) {
				const profile = { id: 'mockSpotifyId123' };
				const accessToken = 'mockAccessToken';
				const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
				const expires_in = 3600;

				verify(
					req,
					accessToken,
					refreshToken,
					expires_in,
					profile,
					(error, user, info) => {
						if (error) {
							return this.error(error);
						}
						if (!user) {
							return this.fail(info);
						}
						this.success(user, info);
					}
				);
			},
		})),
	};
});

describe('Spotify Callback Flow', () => {
	it('should link Spotify service to an existing user', async () => {
		const user = await User.create({
			username: 'mockUsername',
			displayName: 'Mock User',
			email: 'mockuser@example.com',
			password: 'mockPassword123',
			profileImage: 'http://mockProfilePicUrl.org',
			verificationToken: null,
			isVerified: true,
		});

		const response = await request(app)
			.post('/api/auth/login')
			.send({ email: user.email, password: 'mockPassword123' })
			.expect(200);

		await request(app)
			.get('/api/auth/spotify/callback')
			.set('Cookie', response.headers['set-cookie']);

		const updatedUser = await User.findOne({ email: user.email });
		const serviceIndex = updatedUser.linkedServices.findIndex(
			s => s.serviceName === 'spotify'
		);

		expect(serviceIndex).toBeGreaterThan(-1);
		expect(updatedUser.linkedServices[serviceIndex]).toMatchObject({
			serviceName: 'spotify',
			accessToken: 'mockAccessToken',
			refreshToken: process.env.SPOTIFY_REFRESH_TOKEN,
			profileId: 'mockSpotifyId123',
		});
	});
});

describe('Spotify Access Token', () => {
	it('should not return users Access Token if user is unauthenticated', async () => {
		await User.create({
			username: 'mockUsername',
			displayName: 'Mock User',
			email: 'mockuser@example.com',
			password: 'mockPassword123',
			profileImage: 'http://mockProfilePicUrl.org',
			verificationToken: null,
			isVerified: true,
		});

		const response = await request(app).get('/api/spotify/token').expect(401);

		expect(response.body.message).toBe('User is not authenticated');
	});
	it('should not return users Access Token if user has not linked Spotify as a service', async () => {
		await User.create({
			username: 'mockUsername',
			displayName: 'Mock User',
			email: 'mockuser@example.com',
			password: 'mockPassword123',
			profileImage: 'http://mockProfilePicUrl.org',
			verificationToken: null,
			isVerified: true,
		});

		const loginUser = await request(app).post('/api/auth/login').send({
			email: 'mockuser@example.com',
			password: 'mockPassword123',
		});

		const response = await request(app)
			.get('/api/spotify/token')
			.set('Cookie', loginUser.headers['set-cookie'])
			.expect(401);

		expect(response.body.message).toBe(
			'Spotify service not linked or access and refresh tokens missing'
		);
	});
	it('should return users Access Token if user is authenticated and has linked Spotify as a service', async () => {
		await User.create({
			username: 'mockUsername',
			displayName: 'Mock User',
			email: 'mockuser@example.com',
			password: 'mockPassword123',
			profileImage: 'http://mockProfilePicUrl.org',
			verificationToken: null,
			isVerified: true,
		});

		const loginUser = await request(app).post('/api/auth/login').send({
			email: 'mockuser@example.com',
			password: 'mockPassword123',
		});

		await request(app)
			.get('/api/auth/spotify')
			.set('Cookie', loginUser.headers['set-cookie']);

		const response = await request(app)
			.get('/api/spotify/token')
			.set('Cookie', loginUser.headers['set-cookie'])
			.expect(200);

		expect(response.body.token).toBe('mockAccessToken');
	});

	it('should return users Access Token but if the token is expired it should be refreshed', async () => {
		await User.create({
			username: 'mockUsername',
			displayName: 'Mock User',
			email: 'mockuser@example.com',
			password: 'mockPassword123',
			profileImage: 'http://mockProfilePicUrl.org',
			verificationToken: null,
			isVerified: true,
			linkedServices: [
				{
					serviceName: 'spotify',
					profileId: 'mockSpotifyId123',
					accessToken: 'mockAccessToken',
					refreshToken: process.env.SPOTIFY_REFRESH_TOKEN,
					expirationDate: new Date(Date.now()),
				},
			],
		});

		const loginUser = await request(app).post('/api/auth/login').send({
			email: 'mockuser@example.com',
			password: 'mockPassword123',
		});

		const response = await request(app)
			.get('/api/spotify/token')
			.set('Cookie', loginUser.headers['set-cookie'])
			.expect(200);

		expect(response.body.token).toBeDefined();
		expect(response.body.token).not.toBe('mockAccessToken');
	});

	it('should return a new Access Token', async () => {
		let { newAccessToken } = await refreshAccessToken(
			process.env.SPOTIFY_REFRESH_TOKEN
		);

		expect(newAccessToken).toBeDefined();
	});
});
