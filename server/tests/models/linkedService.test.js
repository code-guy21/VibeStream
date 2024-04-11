const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const linkedServiceSchema = require('../../models/LinkedService');

const LinkedService = mongoose.model('linkedservice', linkedServiceSchema);

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
	await LinkedService.init();
});

afterEach(async () => {
	await LinkedService.deleteMany({});
});

afterAll(async () => {
	await mongoose.connection.close();
	await mongoServer.stop();
	console.log('Database connection close');
});

describe('LinkedService Model Test', () => {
	let baseLinkedServiceData = {
		serviceName: 'Spotify',
		profileId: 'profile123',
		accessToken: 'accessToken',
		refreshToken: 'refreshToken',
		expirationDate: new Date(),
		profileLink: 'http://platform.com/user123',
	};

	// Test LinkedService creation is successfull when all required fields are included
	it('should create an LinkedService document when all required fields are included', async () => {
		let savedLinkedService = await new LinkedService(
			baseLinkedServiceData
		).save();

		expect(savedLinkedService._id).toBeDefined();
		expect(savedLinkedService.serviceName).toEqual(
			baseLinkedServiceData.serviceName.toLowerCase()
		);
		expect(savedLinkedService.profileId).toEqual(
			baseLinkedServiceData.profileId
		);
		expect(savedLinkedService.accessToken).toEqual(
			baseLinkedServiceData.accessToken
		);
		expect(savedLinkedService.refreshToken).toEqual(
			baseLinkedServiceData.refreshToken
		);
		expect(savedLinkedService.expirationDate).toEqual(
			baseLinkedServiceData.expirationDate
		);
		expect(savedLinkedService.profileLink).toEqual(
			baseLinkedServiceData.profileLink
		);
	});

	// Test LinkedService creation fails if serviceName is not from valid service provider
	it('should not allow the creation of LinkedService document if serviceName is invalid', async () => {
		const LinkedServiceWithInvalidProvider = {
			...baseLinkedServiceData,
			serviceName: 'Napster',
		};

		await expect(
			new LinkedService(LinkedServiceWithInvalidProvider).save()
		).rejects.toThrow(mongoose.Error.ValidationError);
	});
	// Test LinkedService creation fails if required profileId is missing
	it('should not allow the creation of LinkedService document if profileId is missing', async () => {
		let LinkedServiceWithoutRequiredprofileId = {
			...baseLinkedServiceData,
			profileId: undefined,
		};

		await expect(
			new LinkedService(LinkedServiceWithoutRequiredprofileId).save()
		).rejects.toThrow(mongoose.Error.ValidationError);
	});

	// Test LinkedService creation fails if required accessToken is missing
	it('should not allow the creation of LinkedService document if accessToken is missing', async () => {
		let LinkedServiceWithoutRequiredaccessToken = {
			...baseLinkedServiceData,
			accessToken: undefined,
		};

		await expect(
			new LinkedService(LinkedServiceWithoutRequiredaccessToken).save()
		).rejects.toThrow(mongoose.Error.ValidationError);
	});

	// Test LinkedService creation fails if required refreshToken is missing
	it('should not allow the creation of LinkedService document if refreshToken is missing', async () => {
		let LinkedServiceWithoutRequiredrefreshToken = {
			...baseLinkedServiceData,
			refreshToken: undefined,
		};

		await expect(
			new LinkedService(LinkedServiceWithoutRequiredrefreshToken).save()
		).rejects.toThrow(mongoose.Error.ValidationError);
	});

	// Test LinkedService creation fails if required expirationDate is missing
	it('should not allow the creation of LinkedService document if expirationDate is missing', async () => {
		let LinkedServiceWithoutRequiredExpirationDate = {
			...baseLinkedServiceData,
			expirationDate: undefined,
		};

		await expect(
			new LinkedService(LinkedServiceWithoutRequiredExpirationDate).save()
		).rejects.toThrow(mongoose.Error.ValidationError);
	});

	// Test LinkedService creation fails if profileLink is not a valid URL
	it('should not allow the creation of LinkedService document if profileLink is not a valid URL', async () => {
		let LinkedServiceWithoutValidProfileLinkURL = {
			...baseLinkedServiceData,
			profileLink: 'invalid url',
		};

		await expect(
			new LinkedService(LinkedServiceWithoutValidProfileLinkURL).save()
		).rejects.toThrow(mongoose.Error.ValidationError);
	});
});
