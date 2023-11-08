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
});
