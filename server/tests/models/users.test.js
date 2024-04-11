const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { User } = require('../../models');
const bcrypt = require('bcrypt');

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
	await User.init();
});

afterEach(async () => {
	await User.deleteMany({});
});

afterAll(async () => {
	await mongoose.connection.close();
	await mongoServer.stop();
	console.log('Database connection closed');
});

describe('User Model Test', () => {
	// Test User creation with all required fields
	it('successfully creates a user with valid required fields', async () => {
		const userData = {
			username: 'testuser',
			displayName: 'Test User',
			email: 'testuser@example.com',
		};
		const validUser = new User(userData);
		const savedUser = await validUser.save();

		// Object Id should be defined when successfully saved to MongoDB.
		expect(savedUser._id).toBeDefined();
		expect(savedUser.username).toEqual(userData.username);
		expect(savedUser.email).toEqual(userData.email);
		expect(savedUser.displayName).toEqual(userData.displayName);
	});
	// Test User creation fails when a username is missing
	it('fails to create a user without a required username', async () => {
		const userWithoutRequiredUsername = new User({
			displayName: 'Test User3', // displayName is now provided
			email: 'testuser3@gmail.com',
		});
		let err;
		try {
			await userWithoutRequiredUsername.save();
		} catch (error) {
			err = error;
		}
		expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
		expect(err.errors.username).toBeDefined(); // Now this should be the only error
	});
	//Test user creation fails when using duplicate usernames
	it('prevents the creation of users with duplicate usernames', async () => {
		const userData = {
			username: 'duplicateUser1',
			displayName: 'Test User1',
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

	// Test that the username is converted to lowercase before saving
	it('should save the username field in lowercase', async () => {
		const userData = {
			username: 'TESTUSER',
			displayName: 'Test User',
			email: 'testuser@example.com',
		};
		const user = new User(userData);
		const savedUser = await user.save();

		expect(savedUser.username).toBe(userData.username.toLowerCase());
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

	// Test User creation fails when a displayName is missing
	it('create user without required displayName field should fail', async () => {
		const userWithoutRequiredDisplayName = new User({
			username: 'testuser',
			email: 'testuser3@gmail.com',
		});
		let err;
		try {
			await userWithoutRequiredDisplayName.save();
		} catch (error) {
			err = error;
		}
		expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
		expect(err.errors.displayName).toBeDefined(); // Now this should be the only error
	});

	// Test User creation fails when a password is less than 8 characters
	it('should fail to create a user if the password is less than 8 characters ', async () => {
		const userWithoutRequiredPasswordLength = new User({
			username: 'testuser',
			email: 'testuser3@gmail.com',
			displayName: 'Test User',
			password: '12345',
		});
		let err;
		try {
			await userWithoutRequiredPasswordLength.save();
		} catch (error) {
			err = error;
		}
		expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
	});

	// Test if password is excluded when querying a user
	it('should not include password field when querying a user', async () => {
		const userData = new User({
			username: 'testuser',
			email: 'testuser3@gmail.com',
			displayName: 'Test User',
			password: '123456789',
		});

		await userData.save();

		let searchUser = await User.findOne({ email: userData.email }).select(
			'-password'
		);

		expect(searchUser.password).toBeUndefined();
	});

	// Test if password is hashed before saving
	it('should hash the user password before saving', async () => {
		const userData = new User({
			username: 'testuser',
			email: 'testuser3@gmail.com',
			displayName: 'Test User',
			password: 'plaintextpassword',
		});

		await userData.save();

		let searchUser = await User.findOne({ email: userData.email });

		let isValid = await bcrypt.compare(
			'plaintextpassword',
			searchUser.password
		);

		expect(isValid).toBe(true);
	});
	//Test User creation fails when displayName length is greater than 50 characters
	it('create user with displayName greater than 50 characters should fail', async () => {
		let displayName = [...new Array(51)].fill('*');
		const userWithoutRequiredDisplayNameLength = new User({
			displayName,
			username: 'testuser',
			email: 'testuser@gmail.com',
		});
		let err;
		try {
			await userWithoutRequiredDisplayNameLength.save();
		} catch (error) {
			err = error;
		}
		expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
		expect(err.errors.displayName).toBeDefined(); // Now this should be the only error
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

	//Test user creation fails when using duplicate emails
	it('does not allow duplicate emails', async () => {
		const userData = {
			username: 'duplicateUser2',
			displayName: 'Test User2',
			email: 'testuser2@example.com', // Use a valid email address
		};

		// Save the first user
		const user1 = new User(userData);
		await user1.save();

		// Attempt to save another user with the same email
		const userWithDuplicateEmail = new User({
			...userData,
			username: 'duplicateuser3', // Change the username to another valid one
		});

		let err;
		try {
			await userWithDuplicateEmail.save();
		} catch (error) {
			err = error;
		}
		expect(err).toBeDefined();
		expect(err.code).toEqual(11000); // Error code for duplicate key error
	});

	// Test that the email is converted to lowercase before saving
	it('should save the email field in lowercase', async () => {
		const userData = {
			username: 'testuser',
			displayName: 'Test User',
			email: 'TESTUSER@example.com',
		};
		const user = new User(userData);
		const savedUser = await user.save();

		expect(savedUser.email).toBe(userData.email.toLowerCase());
	});

	//Test User creation fails if email is invalid
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
		}
		expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
		expect(err.errors.email).toBeDefined();
		expect(err.errors.email.message).toContain('valid email');
	});

	//Test User creation fails if profileImage is invalid
	it('should invalidate a user with an invalid profile image', async () => {
		const userWithInvalidProfileImage = new User({
			username: 'testuser',
			displayName: 'Test User',
			email: 'testuser@example.com',
			profileImage: 'profileimage',
		});
		let err;
		try {
			await userWithInvalidProfileImage.save();
		} catch (error) {
			err = error;
		}
		expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
		expect(err.errors.profileImage).toBeDefined();
		expect(err.errors.profileImage.message).toContain('Invalid URL');
	});

	//Test User creation fails when bio length is greater than 160 characters
	it('tests creating user with bio greater than 160 characters should fail', async () => {
		let bio = [...new Array(161)].fill('*');
		const userWithoutRequiredBioLength = new User({
			displayName: 'Test User',
			username: 'testuser',
			email: 'testuser@gmail.com',
			bio,
		});
		let err;
		try {
			await userWithoutRequiredBioLength.save();
		} catch (error) {
			err = error;
		}
		expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
		expect(err.errors.bio).toBeDefined(); // Now this should be the only error
	});

	// Test that fields not defined in the schema are ignored when saving a user
	it('inserts user successfully, but the field not defined in schema should be undefined', async () => {
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

	//Test if playBackHistory is limited to 500 entries
	it('should not allow more than 500 items to be added to playBackHistory', async () => {
		const userData = {
			username: 'testuser',
			displayName: 'Test User',
			email: 'testuser@example.com',
		};

		const savedUser = await new User(userData).save();

		savedUser.playbackHistory = new Array(500).fill({}).map((pb, i) => {
			return {
				songId: `song${i}`,
				platform: 'spotify',
				playedAt: new Date(),
			};
		});

		await expect(savedUser.save()).resolves.toBeDefined();

		savedUser.playbackHistory.push({
			songId: `song500`,
			platform: 'spotify',
			playedAt: new Date(),
		});

		await expect(savedUser.save()).rejects.toThrow(
			mongoose.Error.ValidationError
		);
	});

	// Test if clearPlaybackHistory method clears playback history when called
	it('should clear the playback history array when clearPlaybackHistory method is called', async () => {
		const userData = {
			username: 'testuser',
			displayName: 'Test User',
			email: 'testuser@example.com',
		};

		const savedUser = await new User(userData).save();

		savedUser.playbackHistory.push({
			songId: `song1`,
			platform: 'spotify',
			playedAt: new Date(),
		});

		await savedUser.save();

		expect(savedUser.playbackHistory.length).toBeGreaterThan(0);

		await savedUser.clearPlaybackHistory();

		const updatedUser = await User.findById(savedUser._id);

		expect(updatedUser.playbackHistory.length).toEqual(0);
	});

	it('should remove the oldest visualization in playBackHistory item if max length of 10 is reached', async () => {
		const userData = {
			username: 'testuser',
			displayName: 'Test User',
			email: 'testuser@example.com',
		};

		let createdUser = await new User(userData).save();

		const songId = 'songId123';
		const platform = 'spotify';
		const firstVisualizationId = new mongoose.Types.ObjectId();

		await createdUser.updateOrAddPlaybackHistory(
			songId,
			platform,
			firstVisualizationId
		);

		for (let i = 0; i < 9; i++) {
			await createdUser.updateOrAddPlaybackHistory(
				songId,
				platform,
				new mongoose.Types.ObjectId()
			);

			createdUser = await User.findById(createdUser._id);
		}

		expect(createdUser.playbackHistory[0].visualizations.length).toEqual(10);

		await createdUser.updateOrAddPlaybackHistory(
			songId,
			platform,
			new mongoose.Types.ObjectId()
		);

		createdUser = await User.findById(createdUser._id);

		expect(
			createdUser.playbackHistory[0].visualizations.includes(
				firstVisualizationId
			)
		).toBe(false);
		expect(createdUser.playbackHistory[0].visualizations.length).toEqual(10);
	});

	it('should add an item to playbackHistory array if it does not already exist', async () => {
		const userData = {
			username: 'testuser',
			displayName: 'Test User',
			email: 'testuser@example.com',
		};

		let createdUser = await new User(userData).save();

		expect(createdUser.playbackHistory.length).toEqual(0);

		const songId = 'songId123';
		const platform = 'spotify';
		const visualizationId = new mongoose.Types.ObjectId();

		await createdUser.updateOrAddPlaybackHistory(
			songId,
			platform,
			visualizationId
		);

		createdUser = await User.findById(createdUser._id);

		let playBackItem = createdUser.playbackHistory.findIndex(
			entry => entry.songId === songId
		);

		expect(playBackItem).toBeGreaterThan(-1);
		expect(createdUser.playbackHistory.length).toEqual(1);

		let playbackEntry = createdUser.playbackHistory[playBackItem];

		expect(playbackEntry.songId).toEqual(songId);
		expect(playbackEntry.platform).toEqual(platform);
		expect(playbackEntry.visualizations.includes(visualizationId)).toEqual(
			true
		);
	});

	it('should update playedAt field on a playbackHistory item if it exists in playbackHistory array', async () => {
		const userData = {
			username: 'testuser',
			displayName: 'Test User',
			email: 'testuser@example.com',
		};

		let createdUser = await new User(userData).save();

		let songId = 'songId123';
		let platform = 'spotify';
		let visualizationId = new mongoose.Types.ObjectId();

		await createdUser.updateOrAddPlaybackHistory(
			songId,
			platform,
			visualizationId
		);

		createdUser = await User.findById(createdUser._id);

		const initialPlayback = createdUser.playbackHistory.findIndex(
			entry => entry.songId === songId
		);

		expect(initialPlayback).toBeGreaterThan(-1);

		const initialPlaybackTime =
			createdUser.playbackHistory[initialPlayback].playedAt;

		// Wait a bit before the next update to ensure a noticeable difference in timestamps
		await new Promise(resolve => setTimeout(resolve, 1000));

		await createdUser.updateOrAddPlaybackHistory(
			songId,
			platform,
			visualizationId
		);

		createdUser = await User.findById(createdUser._id);

		const updatedPlaybackIndex = createdUser.playbackHistory.findIndex(
			entry => entry.songId === songId
		);

		expect(updatedPlaybackIndex).toBeGreaterThan(-1);

		const updatedPlaybackTime =
			createdUser.playbackHistory[updatedPlaybackIndex].playedAt;

		expect(createdUser.playbackHistory.length).toEqual(1);
		expect(updatedPlaybackTime).not.toEqual(initialPlaybackTime);
	});
});
