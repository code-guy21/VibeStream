const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { User } = require('../../../models');

let mongoServer;
let app;
let server;

// Set up and tear down of the MongoDB in-memory server
beforeAll(async () => {
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
});

afterAll(async () => {
	await mongoose.connection.close();
	if (app.sessionStore && app.sessionStore.close) {
		await app.sessionStore.close();
	}
	await mongoServer.stop();
	server.close();
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
				const refreshToken = 'mockRefreshToken';
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
			profileId: 'mockSpotifyId123',
		});
	});
});
