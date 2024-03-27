const mongoose = require('mongoose');
const { Track } = require('../models/');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
	mongoServer = await MongoMemoryServer.create();
	const mongoUri = mongoServer.getUri();
	await mongoose.connect(mongoUri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
});

beforeEach(async () => {
	await Track.init();
});

afterEach(async () => {
	await Track.deleteMany({});
});

afterAll(async () => {
	await mongoose.connection.close();
	await mongoServer.stop();
	console.log('Database connection closed');
});

describe('PlayBackHistory Schema Test', () => {
	const baseTrackData = {
		trackId: 'track123',
		platform: 'Spotify',
	};

	/// Test Track creation with all required fields
	it('successfully creates and saves a Track document with valid trackId and platform', async () => {
		let savedTrack = await new Track(baseTrackData).save();
		expect(savedTrack._id).toBeDefined();
		expect(savedTrack.trackId).toEqual(baseTrackData.trackId);
		expect(savedTrack.platform).toEqual(baseTrackData.platform.toLowerCase());
	});

	// Test Track creation fails if platform is unsupported
	it('fails to create a Track document with an unsupported platform', async () => {
		const invalidPlatformData = {
			...baseTrackData,
			platform: 'UnsupportedPlatform',
		};
		await expect(new Track(invalidPlatformData).save()).rejects.toThrow(
			mongoose.Error.ValidationError
		);
	});

	// Test Track creation fails if required trackId is missing
	it('should not allow for Track creation if trackId is missing', async () => {
		const dataWithoutTrackId = { ...baseTrackData, trackId: undefined };

		await expect(new Track(dataWithoutTrackId).save()).rejects.toThrow(
			mongoose.Error.ValidationError
		);
	});

	// Test Track creation fails if required platform is missing
	it('should not allow for the creation Track if platform is missing', async () => {
		const dataWithoutPlatform = {
			...baseTrackData,
			platform: undefined,
		};

		await expect(new Track(dataWithoutPlatform).save()).rejects.toThrow(
			mongoose.Error.ValidationError
		);
	});
});
