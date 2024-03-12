const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { Visualization } = require('../models/');

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
	await Visualization.init();
});

afterEach(async () => {
	await Visualization.deleteMany({});
});

afterAll(async () => {
	await mongoose.connection.close();
	await mongoServer.stop();
	console.log('Database connection closed');
});

describe('Visualization Model Test', () => {
	const baseVisualizationData = {
		songId: 'mock-song-id-123',
		platform: 'Spotify',
		visualizationData: {},
		createdBy: new mongoose.Types.ObjectId(),
	};

	it('creates a visualization when all required fields are included', async () => {
		let savedVisualization = await new Visualization(
			baseVisualizationData
		).save();
		expect(savedVisualization._id).toBeDefined();
		expect(savedVisualization.songId).toEqual(baseVisualizationData.songId);
		expect(savedVisualization.platform).toEqual(
			baseVisualizationData.platform.toLowerCase()
		);
		expect(savedVisualization.visualizationData).toEqual(
			baseVisualizationData.visualizationData
		);
		expect(savedVisualization.createdBy).toEqual(
			baseVisualizationData.createdBy
		);
	});

	it('does not allow creation of visualization if songId is missing', async () => {
		const dataWithoutSongId = { ...baseVisualizationData, songId: undefined };
		await expect(new Visualization(dataWithoutSongId).save()).rejects.toThrow(
			mongoose.Error.ValidationError
		);
	});

	it('does not allow the creation of a visualization if platform is missing', async () => {
		const dataWithoutPlatform = {
			...baseVisualizationData,
			platform: undefined,
		};
		await expect(new Visualization(dataWithoutPlatform).save()).rejects.toThrow(
			mongoose.Error.ValidationError
		);
	});

	it('does not allow the creation of a visualization if platform is invalid', async () => {
		const dataWithInvalidPlatform = {
			...baseVisualizationData,
			platform: 'invalidPlatform',
		};
		await expect(
			new Visualization(dataWithInvalidPlatform).save()
		).rejects.toThrow(mongoose.Error.ValidationError);
	});

	it('should save the platform name in lowercase', async () => {
		const dataWithUppercasePlatform = {
			...baseVisualizationData,
			platform: 'SPOTIFY',
		};
		let savedVisualization = await new Visualization(
			dataWithUppercasePlatform
		).save();
		expect(savedVisualization.platform).toEqual(
			dataWithUppercasePlatform.platform.toLowerCase()
		);
	});

	it('does not allow the creation of a visualization if visualizationData is missing', async () => {
		const dataWithoutVisualizationData = {
			...baseVisualizationData,
			visualizationData: undefined,
		};
		await expect(
			new Visualization(dataWithoutVisualizationData).save()
		).rejects.toThrow(mongoose.Error.ValidationError);
	});

	it('does not allow creation of visualization if createdBy is missing', async () => {
		const dataWithoutCreatedBy = {
			...baseVisualizationData,
			createdBy: undefined,
		};
		await expect(
			new Visualization(dataWithoutCreatedBy).save()
		).rejects.toThrow(mongoose.Error.ValidationError);
	});

	it('should set visibility to default before saving', async () => {
		let savedVisualization = await new Visualization(
			baseVisualizationData
		).save();
		expect(savedVisualization.visibility).toEqual('default');
	});
});
