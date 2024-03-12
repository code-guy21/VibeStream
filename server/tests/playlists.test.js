const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { Playlist } = require('../models');

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
	await Playlist.init();
});

afterEach(async () => {
	await Playlist.deleteMany({});
});

afterAll(async () => {
	await mongoose.connection.close();
	await mongoServer.stop();
	console.log('Database connection closed');
});

describe('Playlist model test', () => {
	const playlistData = {
		platformPlaylistId: 'testid123',
		platform: 'Spotify',
		title: 'testplaylist',
		description: 'test description',
		owner: new mongoose.Types.ObjectId(),
	};
	// Test playlist creation is successfull
	it('creates a playlist when all required fields are included', async () => {
		let savedPlaylist = await new Playlist(playlistData).save();

		expect(savedPlaylist._id).toBeDefined();
		expect(savedPlaylist.platformPlaylistId).toEqual(
			playlistData.platformPlaylistId
		);
		expect(savedPlaylist.platform).toEqual(playlistData.platform.toLowerCase());
		expect(savedPlaylist.title).toEqual(playlistData.title);
		expect(savedPlaylist.description).toEqual(playlistData.description);
		expect(savedPlaylist.owner).toEqual(playlistData.owner);
	});
	// Test playlist creation fails if required playlist ID is missing
	it('does not allow the creation of a playlist if playlist is platform type and the required playlist ID is missing', async () => {
		const dataWithPlatformAndMissingId = {
			...playlistData,
			playlistType: 'platform',
			platformPlaylistId: null,
		};

		await expect(
			new Playlist(dataWithPlatformAndMissingId).save()
		).rejects.toThrow(mongoose.Error.ValidationError);
	});
	// Test playlist creation fails if required platform is missing
	it('does not allow the creation of a playlist if required platform is missing', async () => {
		const { platform, ...dataWithoutPlatform } = playlistData;

		await expect(new Playlist(dataWithoutPlatform).save()).rejects.toThrow(
			mongoose.Error.ValidationError
		);
	});
	// Test playlist creation fails if platform is not supported
	it('does not allow the creation of a playlist if the platform is not supported', async () => {
		const dataWithUnsupportedPlatform = {
			...playlistData,
			platform: 'UnsupportedPlatform',
		};
		await expect(
			new Playlist(dataWithUnsupportedPlatform).save()
		).rejects.toThrow(/is not a supported music platform/);
	});
	// Tests if platform gets stored in lowercase when playlist is created
	it('tests if platform gets stored in lowercase when the playlist is created', async () => {
		const dataWithUppercasePlatform = {
			...playlistData,
			platform: 'SPOTIFY',
		};
		let savedPlaylist = await new Playlist(dataWithUppercasePlatform).save();
		await expect(savedPlaylist.platform).toEqual(
			dataWithUppercasePlatform.platform.toLowerCase()
		);
	});
	// Tests playlist creation fails if title is missing
	it('does not allow for the creation of a playlist if required title is missing', async () => {
		const { title, ...dataWithoutTitle } = playlistData;

		await expect(new Playlist(dataWithoutTitle).save()).rejects.toThrow(
			mongoose.Error.ValidationError
		);
	});
	// Tests playlist creation fails if title does not meet the minimum length
	it('does not allow for the creation of a playlist if the title does not meet the minimum required length', async () => {
		const dataWithoutMinimumTitleLength = {
			...playlistData,
			title: '',
		};

		await expect(
			new Playlist(dataWithoutMinimumTitleLength).save()
		).rejects.toThrow(mongoose.Error.ValidationError);
	});
	// Tests playlist creation fails if title length exceed the maximum
	it('does not allow for the creation of a playlist if the title length exceed the maximum', async () => {
		const longTitle = '*'.repeat(101);
		const dataWithTitleLengthAboveMaximum = {
			...playlistData,
			title: longTitle,
		};

		await expect(
			new Playlist(dataWithTitleLengthAboveMaximum).save()
		).rejects.toThrow(mongoose.Error.ValidationError);
	});

	// Tests playlist creation fails if description does not meet the minimum length
	it('does not allow for the creation of a playlist if the description does not meet the minimum required length', async () => {
		const dataWithoutMinimumDescriptionLength = {
			...playlistData,
			description: '',
		};

		await expect(
			new Playlist(dataWithoutMinimumDescriptionLength).save()
		).rejects.toThrow(mongoose.Error.ValidationError);
	});
	// Tests playlist creation fails if description exceeds the maximum length
	it('does not allow for the creation of a playlist if the description length exceeds the maximum', async () => {
		const longDescription = '*'.repeat(256);
		const dataWithDescriptionLengthAboveMaximum = {
			...playlistData,
			description: longDescription,
		};

		await expect(
			new Playlist(dataWithDescriptionLengthAboveMaximum).save()
		).rejects.toThrow(mongoose.Error.ValidationError);
	});
	// Test if the playlist does not allow more than 5000 tracks to be added
	it('should not allow more than 5000 tracks to be added to the playlist', async () => {
		let savedPlaylist = await new Playlist(playlistData).save();

		savedPlaylist.trackIds = new Array(5000)
			.fill('trackid')
			.map((id, index) => id + index);

		await expect(savedPlaylist.save()).resolves.toBeDefined();

		// Attempt to add one more track, which should trigger the validation error
		await expect(savedPlaylist.addTrack(`trackid5000`)).rejects.toThrow(
			mongoose.Error.ValidationError
		);
	});

	// Test if visibility is set to default when playlist is created
	it('sets the visiblity of a playlist to default if none are specified', async () => {
		let savedPlaylist = await new Playlist(playlistData).save();

		expect(savedPlaylist.visibility).toEqual('default');
	});
	// Test if playlist type is set to vibstream by default when playlist is created
	it('sets the playlist type to vibestream by default when playlist is created', async () => {
		let savedPlaylist = await new Playlist(playlistData).save();

		expect(savedPlaylist.playlistType).toEqual('vibestream');
	});
	// Tests if sync with platform option is set to false by default
	it('sets the sync with platform option to false by default', async () => {
		let savedPlaylist = await new Playlist(playlistData).save();

		expect(savedPlaylist.syncWithPlatform).toEqual(false);
	});
	// Test playlist creation fails if required owner ID is missing
	it('does not allow the creation of a playlist if required owner ID is missing', async () => {
		const { owner, ...dataWithoutOwnerId } = playlistData;

		await expect(new Playlist(dataWithoutOwnerId).save()).rejects.toThrow(
			mongoose.Error.ValidationError
		);
	});
	// Test if track is added to playlist when running the addTrack method
	it('should add a new track to the playlist if it is not already present', async () => {
		let savedPlaylist = await new Playlist(playlistData).save();
		await savedPlaylist.addTrack('newtrackid5001'); // Use the method to add a track
		savedPlaylist = await Playlist.findById(savedPlaylist._id); // Reload to verify changes

		expect(savedPlaylist.trackIds).toContain('newtrackid5001');
	});
	// Test if track is removed from playlist when running the removeTrack method
	it('should remove a track from the playlist if it is present', async () => {
		let savedPlaylist = await new Playlist({
			...playlistData,
			trackIds: ['trackToRemove'],
		}).save();
		await savedPlaylist.removeTrack('trackToRemove'); // Use the method to remove a track
		savedPlaylist = await Playlist.findById(savedPlaylist._id); // Reload to verify changes

		expect(savedPlaylist.trackIds).not.toContain('trackToRemove');
	});
});
