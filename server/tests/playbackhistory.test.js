const mongoose = require('mongoose');
const { playbackHistorySchema } = require('../models');
const { MongoMemoryServer } = require('mongodb-memory-server');

const PlayBackHistory = mongoose.model(
	'playbackhistory',
	playbackHistorySchema
);

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
	await PlayBackHistory.init();
});

afterEach(async () => {
	await PlayBackHistory.deleteMany({});
});

afterAll(async () => {
	await mongoose.connection.close();
	await mongoServer.stop();
	console.log('Database connection closed');
});

describe('PlayBackHistory Schema Test', () => {
	const basePlaybackHistoryData = {
		songId: 'mock-song-id-123',
		platform: 'Spotify',
		playedAt: new Date(),
	};

	/// Test PlaybackHistory creation with all required fields
	it('creates and saves PlayBackHistory when all required fields are included', async () => {
		let savedPlayBackHistory = await new PlayBackHistory(
			basePlaybackHistoryData
		).save();
		expect(savedPlayBackHistory._id).toBeDefined();
		expect(savedPlayBackHistory.songId).toEqual(basePlaybackHistoryData.songId);
		expect(savedPlayBackHistory.platform).toEqual(
			basePlaybackHistoryData.platform.toLowerCase()
		);
		expect(savedPlayBackHistory.playedAt).toEqual(
			basePlaybackHistoryData.playedAt
		);
	});

	// Test PlayBackHistory creation fails if required songId is missing
	it('should not allow for the creation playBackHistory if songId is missing', async () => {
		const dataWithoutSongId = { ...basePlaybackHistoryData, songId: undefined };

		await expect(new PlayBackHistory(dataWithoutSongId).save()).rejects.toThrow(
			mongoose.Error.ValidationError
		);
	});

	// Test PlayBackHistory creation fails if required platform is missing
	it('should not allow for the creation playBackHistory if platform is missing', async () => {
		const dataWithoutPlatform = {
			...basePlaybackHistoryData,
			platform: undefined,
		};

		await expect(
			new PlayBackHistory(dataWithoutPlatform).save()
		).rejects.toThrow(mongoose.Error.ValidationError);
	});

	// Test PlayBackHistory creation fails if playedAt field is missing
	it('should not allow for the creation playBackHistory if playedAt field is missing', async () => {
		const dataWithoutPlayedAt = {
			...basePlaybackHistoryData,
			playedAt: undefined,
		};

		await expect(
			new PlayBackHistory(dataWithoutPlayedAt).save()
		).rejects.toThrow(mongoose.Error.ValidationError);
	});
});
