const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { Playlist, Track } = require('../../models');

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
	await Track.init();
});

afterEach(async () => {
	await Playlist.deleteMany({});
	await Track.deleteMany({});
});

afterAll(async () => {
	await mongoose.connection.close();
	await mongoServer.stop();
	console.log('Database connection closed');
});

describe('Playlist model test', () => {
	const playlistData = {
		title: 'testplaylist',
		description: 'test description',
		owner: new mongoose.Types.ObjectId(),
	};
	// Test playlist creation is successfull
	it('creates a playlist when all required fields are included', async () => {
		let savedPlaylist = await new Playlist(playlistData).save();

		expect(savedPlaylist._id).toBeDefined();
		expect(savedPlaylist.title).toEqual(playlistData.title);
		expect(savedPlaylist.description).toEqual(playlistData.description);
		expect(savedPlaylist.owner).toEqual(playlistData.owner);
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

		for (let i = 0; i < 5000; i++) {
			savedPlaylist.tracks.push(new mongoose.Types.ObjectId());
		}
		await savedPlaylist.save(); // Save with 5000 tracks

		let anotherTrack = await Track.create({
			trackId: 'trackid5001',
			platform: 'spotify',
		});

		// Attempt to add one more track, which should trigger the validation error
		await expect(savedPlaylist.addTrack(anotherTrack._id)).rejects.toThrow(
			mongoose.Error.ValidationError
		);
	});

	// Test if visibility is set to default when playlist is created
	it('sets the visiblity of a playlist to default if none are specified', async () => {
		let savedPlaylist = await new Playlist(playlistData).save();

		expect(savedPlaylist.visibility).toEqual('default');
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
		let anotherTrack = await Track.create({
			trackId: 'trackid',
			platform: 'spotify',
		});
		await savedPlaylist.addTrack(anotherTrack._id); // Use the method to add a track
		savedPlaylist = await Playlist.findById(savedPlaylist._id); // Reload to verify changes

		expect(savedPlaylist.tracks.map(track => track.toString())).toContain(
			anotherTrack._id.toString()
		);
	});
	// Test if track is removed from playlist when running the removeTrack method
	it('should remove a track from the playlist if it is present', async () => {
		let savedPlaylist = await new Playlist({
			...playlistData,
		}).save();

		let anotherTrack = await Track.create({
			trackId: 'trackid',
			platform: 'spotify',
		});

		await savedPlaylist.addTrack(anotherTrack._id);

		savedPlaylist = await Playlist.findById(savedPlaylist._id);

		await savedPlaylist.removeTrack(anotherTrack._id); // Use the method to remove a track

		expect(savedPlaylist.tracks).not.toContain(anotherTrack._id);
	});
});
