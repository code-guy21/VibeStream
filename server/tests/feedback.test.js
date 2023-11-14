require('dotenv').config();
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { Feedback } = require('../models');

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
	await Feedback.init();
});

afterEach(async () => {
	await Feedback.deleteMany({});
});

afterAll(async () => {
	await mongoose.connection.close();
	await mongoServer.stop();
	console.log('Database connection closed');
});

describe('Feedback Model Test', () => {
	const baseFeedbackData = {
		rating: 4,
		comment: 'This is a comment!',
		submittedBy: new mongoose.Types.ObjectId(),
		relatedVisualization: new mongoose.Types.ObjectId(),
	};

	it('should create a feedback when required fields are included', async () => {
		let savedFeedback = await new Feedback(baseFeedbackData).save();
		expect(savedFeedback._id).toBeDefined();
		expect(savedFeedback.rating).toEqual(baseFeedbackData.rating);
		expect(savedFeedback.comment).toEqual(baseFeedbackData.comment);
		expect(savedFeedback.submittedBy).toEqual(baseFeedbackData.submittedBy);
		expect(savedFeedback.relatedVisualization).toEqual(
			baseFeedbackData.relatedVisualization
		);
	});

	it('does not allow creating feedback if required rating is missing', async () => {
		const { rating, ...dataWithoutRating } = baseFeedbackData;
		await expect(new Feedback(dataWithoutRating).save()).rejects.toThrow(
			mongoose.Error.ValidationError
		);
	});

	it("does not allow creating feedback if rating doesn't meet minimum value", async () => {
		await expect(
			new Feedback({ ...baseFeedbackData, rating: 0 }).save()
		).rejects.toThrow(mongoose.Error.ValidationError);
	});

	it('does not allow creating feedback if rating is greater than the maximum', async () => {
		await expect(
			new Feedback({ ...baseFeedbackData, rating: 6 }).save()
		).rejects.toThrow(mongoose.Error.ValidationError);
	});

	it('does not allow creating feedback if comment length is out of range', async () => {
		let longComment = 'a'.repeat(151);
		await expect(
			new Feedback({ ...baseFeedbackData, comment: longComment }).save()
		).rejects.toThrow(mongoose.Error.ValidationError);
	});

	it('does not allow creating feedback if submittedBy value is missing', async () => {
		const { submittedBy, ...dataWithoutUser } = baseFeedbackData;
		await expect(new Feedback(dataWithoutUser).save()).rejects.toThrow(
			mongoose.Error.ValidationError
		);
	});

	it('does not allow creating feedback if relatedVisualization value is missing', async () => {
		const { relatedVisualization, ...dataWithoutVisualization } =
			baseFeedbackData;
		await expect(new Feedback(dataWithoutVisualization).save()).rejects.toThrow(
			mongoose.Error.ValidationError
		);
	});
});
