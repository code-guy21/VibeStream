const mongoose = require('mongoose');
const playbackHistorySchema = require('../models/PlaybackHistory');
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

	// Test PlaybackHistory creation fails if platform is unsupported
	it('rejects unsupported platforms', async () => {
		const invalidPlatformData = {
			...basePlaybackHistoryData,
			platform: 'UnsupportedPlatform',
		};
		await expect(
			new PlayBackHistory(invalidPlatformData).save()
		).rejects.toThrow(
			/`unsupportedplatform` is not a valid enum value for path `platform`/
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

	// Test related visualization is not added if limit is reached
	it('enforces the limit on the number of visualizations', async () => {
		const dataWithExcessiveVisualizations = {
			...basePlaybackHistoryData,
			visualizations: new Array(11)
				.fill(null)
				.map(() => new mongoose.Types.ObjectId()),
		};
		await expect(
			new PlayBackHistory(dataWithExcessiveVisualizations).save()
		).rejects.toThrow(/exceeds the limit of 10/);
	});
});
