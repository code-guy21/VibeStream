require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const testDbUrl =
	process.env.TEST_DATABASE_URL || 'mongodb://127.0.0.1/vibestreamDB_test';

// Set up a test database connection
beforeAll(async () => {
	await mongoose.connect(testDbUrl, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
});

// Clear the database after each test
afterEach(async () => {
	await mongoose.connection.db.dropDatabase();
});

// Disconnect Mongoose after all tests are done
afterAll(async () => {
	await mongoose.connection.close();
});

describe('User Model Test', () => {
	it('does not allow duplicate usernames', async () => {
		const userData = {
			username: 'duplicateUser',
			displayName: 'Test User',
			email: 'testuser1@example.com', // Use a valid email address
		};

		// Save the first user
		const user1 = new User(userData);
		await user1.save();

		// Attempt to save another user with the same username
		const userWithDuplicateUsername = new User({
			...userData,
			email: 'testuser2@example.com', // Change the email to another valid one
		});

		let err;
		try {
			await userWithDuplicateUsername.save();
		} catch (error) {
			err = error;
		}

		expect(err).toBeDefined();
		expect(err.code).toEqual(11000); // Error code for duplicate key error
	});
	// Test User creation with all required fields
	it('create & save user successfully', async () => {
		const userData = {
			username: 'testuser',
			displayName: 'Test User',
			email: 'testuser@example.com',
		};
		const validUser = new User(userData);
		const savedUser = await validUser.save();

		// Object Id should be defined when successfully saved to MongoDB.
		expect(savedUser._id).toBeDefined();
		expect(savedUser.username).toBe(userData.username);
		expect(savedUser.email).toBe(userData.email);
	});

	// Test that fields not defined in the schema are ignored when saving a user
	it('insert user successfully, but the field not defined in schema should be undefined', async () => {
		const userWithInvalidField = new User({
			username: 'testuser',
			displayName: 'Test User', // displayName must be provided since it's required
			email: 'testuser@example.com', // email must also be provided since it's required
			nickname: 'Johnny', // nickname is not defined in the User schema
		});
		const savedUserWithInvalidField = await userWithInvalidField.save();
		expect(savedUserWithInvalidField._id).toBeDefined();
		expect(savedUserWithInvalidField.nickname).toBeUndefined(); // This is what you're testing
	});
	// Test User creation fails when a required field is missing
	it('create user without required email field should fail', async () => {
		const userWithoutRequiredEmail = new User({
			username: 'testuser',
			displayName: 'Test User', // displayName is now provided
		});
		let err;
		try {
			await userWithoutRequiredEmail.save();
		} catch (error) {
			err = error;
		}
		expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
		expect(err.errors.email).toBeDefined(); // Now this should be the only error
	});

	it('should invalidate a user with an invalid email address', async () => {
		const userWithInvalidEmail = new User({
			username: 'testuser',
			displayName: 'Test User',
			email: 'not-an-email',
		});
		let err;
		try {
			await userWithInvalidEmail.save();
		} catch (error) {
			err = error;
			console.log(error);
		}
		expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
		expect(err.errors.email).toBeDefined();
		expect(err.errors.email.message).toContain('valid email');
	});

	// Test default values for visibility options
	it('should have default visibility set to public', async () => {
		const userData = {
			username: 'defaultvisibility',
			displayName: 'Default Visibility User',
			email: 'defaultvisibility@example.com',
		};
		const user = new User(userData);
		await user.save();
		expect(user.globalPlaylistVisibility).toEqual('public');
		expect(user.globalVisualizationVisibility).toEqual('public');
	});

	// Test for invalid username characters
	it('should invalidate a user with invalid username characters', async () => {
		const userWithInvalidUsername = new User({
			username: 'invalid user!', // Invalid characters for username
			displayName: 'Test User',
			email: 'testuser@example.com',
		});
		let err;
		try {
			await userWithInvalidUsername.save();
		} catch (error) {
			err = error;
		}
		expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
		expect(err.errors.username).toBeDefined();
		expect(err.errors.username.message).toContain('invalid characters');
	});
});
