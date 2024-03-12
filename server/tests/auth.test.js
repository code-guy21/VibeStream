const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { Auth } = require('../models/');

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
	await Auth.init();
});

afterEach(async () => {
	await Auth.deleteMany({});
});

afterAll(async () => {
	await mongoose.connection.close();
	await mongoServer.stop();
	console.log('Database connection close');
});

describe('Auth Model Test', () => {
	let baseAuthData = {
		authProvider: 'Spotify',
		profileId: 'profile123',
		encryptedAuthToken: 'encryptedToken',
		encryptedRefreshToken: 'refreshToken',
		expirationDate: new Date(),
		profileLink: 'http://platform.com/user123',
	};

	// Test Auth creation is successfull when all required fields are included
	it('should create an Auth document when all required fields are included', async () => {
		let savedAuth = await new Auth(baseAuthData).save();

		expect(savedAuth._id).toBeDefined();
		expect(savedAuth.authProvider).toEqual(
			baseAuthData.authProvider.toLowerCase()
		);
		expect(savedAuth.profileId).toEqual(baseAuthData.profileId);
		expect(savedAuth.encryptedAuthToken).toEqual(
			baseAuthData.encryptedAuthToken
		);
		expect(savedAuth.encryptedRefreshToken).toEqual(
			baseAuthData.encryptedRefreshToken
		);
		expect(savedAuth.expirationDate).toEqual(baseAuthData.expirationDate);
		expect(savedAuth.profileLink).toEqual(baseAuthData.profileLink);
	});

	// Test Auth creation fails if authProvider is not from valid platform
	it('should not allow the creation of Auth document is authProvider platform is invalid', async () => {
		const authWithInvalidPlatform = {
			...baseAuthData,
			authProvider: 'Yahoo',
		};

		await expect(new Auth(authWithInvalidPlatform).save()).rejects.toThrow(
			mongoose.Error.ValidationError
		);
	});
	// Test Auth creation fails if required profileId is missing
	it('should not allow the creation of Auth document if profileId is missing', async () => {
		let authWithoutRequiredProfileId = {
			...baseAuthData,
			profileId: undefined,
		};

		await expect(new Auth(authWithoutRequiredProfileId).save()).rejects.toThrow(
			mongoose.Error.ValidationError
		);
	});

	// Test Auth creation fails if required encryptedAuthToken is missing
	it('should not allow the creation of Auth document if encryptedAuthToken is missing', async () => {
		let authWithoutRequiredEncryptedAuthToken = {
			...baseAuthData,
			encryptedAuthToken: undefined,
		};

		await expect(
			new Auth(authWithoutRequiredEncryptedAuthToken).save()
		).rejects.toThrow(mongoose.Error.ValidationError);
	});

	// Test Auth creation fails if required encryptedRefreshToken is missing
	it('should not allow the creation of Auth document if encryptedRefreshToken is missing', async () => {
		let authWithoutRequiredEncryptedRefreshToken = {
			...baseAuthData,
			encryptedRefreshToken: undefined,
		};

		await expect(
			new Auth(authWithoutRequiredEncryptedRefreshToken).save()
		).rejects.toThrow(mongoose.Error.ValidationError);
	});

	// Test Auth creation fails if required expirationDate is missing
	it('should not allow the creation of Auth document if expirationDate is missing', async () => {
		let authWithoutRequiredExpirationDate = {
			...baseAuthData,
			expirationDate: undefined,
		};

		await expect(
			new Auth(authWithoutRequiredExpirationDate).save()
		).rejects.toThrow(mongoose.Error.ValidationError);
	});

	// Test Auth creation fails if profileLink is not a valid URL
	it('should not allow the creation of Auth document if profileLink is not a valid URL', async () => {
		let authWithoutValidProfileLinkURL = {
			...baseAuthData,
			profileLink: 'invalid url',
		};

		await expect(
			new Auth(authWithoutValidProfileLinkURL).save()
		).rejects.toThrow(mongoose.Error.ValidationError);
	});
});
