const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { User } = require('../../../models');
const bcrypt = require('bcrypt');
let server;
let app;
let mongoServer;

beforeAll(async () => {
	mongoServer = await MongoMemoryServer.create();
	const mongoUri = mongoServer.getUri();

	process.env.MONGODB_URI = mongoUri;

	console.log('Connecting to database...');

	await mongoose.connect(mongoUri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	console.log('Database connected');

	app = require('../../../app');

	server = app.listen(0);

	await new Promise(resolve => server.once('listening', resolve));
});

afterAll(async function () {
	await mongoose.connection.close();

	// Close the MongoStore connection
	if (app.sessionStore && app.sessionStore.close) {
		await app.sessionStore.close();
	}

	if (mongoServer) {
		await mongoServer.stop();
		console.log('Database connection closed');
	}

	// Shut down the server
	if (server) {
		server.close();
	}
});

beforeEach(async function () {
	await User.deleteMany();
});

describe('passport-local', function () {
	it('creates and registers a user with local passport strategy', async function () {
		const response = await request(app).post('/api/auth/register').send({
			username: 'mockUsername',
			displayName: 'Mock User',
			email: 'mockuser@example.com',
			password: 'mockPassword123',
			profileImage: 'http://mockProfilePicUrl.org',
		});

		const user = await User.findOne({ email: 'mockuser@example.com' });

		console.log(user);

		expect(user).toBeTruthy();
		expect(user.username.toLowerCase()).toBe('mockusername');
		expect(user.email).toBe('mockuser@example.com');
		expect(await bcrypt.compare('mockPassword123', user.password)).toBe(true);
		expect(user.profileImage).toBe('http://mockProfilePicUrl.org');
	});
});
