require('dotenv').config();
const mongoose = require('mongoose');
const { Visualization } = require('../models/');

const testDbUrl = process.env.TEST_DATABASE_URL;

beforeAll(async () => {
	await mongoose.connect(testDbUrl, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	// Ensure indexes are built
	await Visualization.init();
});

afterEach(async () => {
	await Visualization.deleteMany({});
});

afterAll(async () => {
	await mongoose.connection.db.dropDatabase();
	await mongoose.connection.close();
});

describe('Visualization Model Test', () => {
	// Test if visualization is successfully created when all required field are included
	it('creates a visualization when all required fields are included', async () => {
		const testVisualization = {
			songId: 'mock-song-id-123',
			platform: 'spotify',
			visualizationData: {},
			createdBy: new mongoose.Types.ObjectId(),
		};

		let validVisualization = new Visualization(testVisualization);
		let savedVisualization = await validVisualization.save();

		expect(savedVisualization._id).toBeDefined();
		expect(savedVisualization.songId).toEqual(testVisualization.songId);
		expect(savedVisualization.platform).toEqual(
			testVisualization.platform.toLowerCase()
		);
		expect(savedVisualization.visualizationData).toEqual(
			testVisualization.visualizationData
		);
		expect(savedVisualization.createdBy).toBe(testVisualization.createdBy);
	});
	// Test Visualization creation fails if songId is missing
	it('does not allow creation of visualization if songId is missing', async () => {
		const visualizationWithoutSongId = new Visualization({
			platform: 'Spotify',
			visualizationData: {},
			createdBy: new mongoose.Types.ObjectId(),
		});

		let err;

		try {
			await visualizationWithoutSongId.save();
		} catch (error) {
			err = error;
		}

		expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
		expect(err.errors.songId).toBeDefined();
	});

	// Test Visualization creation fails if platform is missing
	it('does not allow the creation of a visualization if platform is missing', async () => {
		const testVisualization = {
			songId: 'mock-song-id-123',
			visualizationData: {},
			createdBy: new mongoose.Types.ObjectId(),
		};

		const visualizationWithoutPlatform = new Visualization(testVisualization);

		let err;

		try {
			await visualizationWithoutPlatform.save();
		} catch (error) {
			err = error;
		}

		expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
		expect(err.errors.platform).toBeDefined();
	});

	// Test Visualization creation fails if platform is not valid
	it('does not allow the creation of a visualization if platform is invalid', async () => {
		const testVisualization = {
			songId: 'mock-song-id-123',
			platform: 'apple',
			visualizationData: {},
			createdBy: new mongoose.Types.ObjectId(),
		};

		const visualizationWithInvalidPlatform = new Visualization(
			testVisualization
		);

		let err;

		try {
			await visualizationWithInvalidPlatform.save();
		} catch (error) {
			err = error;
		}

		expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
		expect(err.errors.platform).toBeDefined();
	});

	// Test platform name is lowercased before saving
	it('should save the platform name in lowercase', async () => {
		const testVisualization = {
			songId: 'mock-song-id-123',
			platform: 'Spotify',
			visualizationData: {},
			createdBy: new mongoose.Types.ObjectId(),
		};

		const visualizationWithPlatform = new Visualization(testVisualization);

		let savedVisualization = await visualizationWithPlatform.save();

		expect(savedVisualization.platform).toEqual(
			testVisualization.platform.toLowerCase()
		);
	});

	// Test Visualization creation fails if visualizationData is missing
	it('does not allow the creation of a visualization if visualizationData is missing', async () => {
		const testVisualization = {
			songId: 'mock-song-id-123',
			platform: 'apple',
			createdBy: new mongoose.Types.ObjectId(),
		};

		const visualizationWithInvalidPlatform = new Visualization(
			testVisualization
		);

		let err;

		try {
			await visualizationWithInvalidPlatform.save();
		} catch (error) {
			err = error;
		}

		expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
		expect(err.errors.visualizationData).toBeDefined();
	});
	// Test Visualization creation fails if createdBy is missing
	it('does not allow creation of visualization if createdBy is missing', async () => {
		const visualizationDataWithoutUser = {
			songId: 'mock-song-id-123',
			platform: 'spotify',
			visualizationData: {
				/* ...some data... */
			},
			// createdBy is intentionally left out
		};

		const visualizationWithoutUser = new Visualization(
			visualizationDataWithoutUser
		);
		let err;

		try {
			await visualizationWithoutUser.save();
		} catch (error) {
			err = error;
		}

		expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
		expect(err.errors.createdBy).toBeDefined();
	});

	// Test visibility is set to default before saving
	it('should set visibility to default before saving', async () => {
		const testVisualization = {
			songId: 'mock-song-id-123',
			platform: 'Spotify',
			visualizationData: {},
			createdBy: new mongoose.Types.ObjectId(),
		};

		const visualizationWithPlatform = new Visualization(testVisualization);

		let savedVisualization = await visualizationWithPlatform.save();

		expect(savedVisualization.visibility).toEqual('default');
	});

	// Test default likes are set to zero before saving
	it('should set likes to zero by default before saving', async () => {
		const testVisualization = {
			songId: 'mock-song-id-123',
			platform: 'Spotify',
			visualizationData: {},
			createdBy: new mongoose.Types.ObjectId(),
		};

		const visualizationWithPlatform = new Visualization(testVisualization);

		let savedVisualization = await visualizationWithPlatform.save();

		expect(savedVisualization.likes).toEqual(0);
	});
});
