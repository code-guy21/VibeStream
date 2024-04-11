// Import statements
const { Schema, model } = require('mongoose');
const Track = require('./Track');

// Constants for enums
const { VISIBILITY } = require('../utils/constants');

// Playlist Schema definition
/**
 * Schema to represent a Playlist in VibeStream application
 * @module PlaylistModel
 * @description Handles the schema definition for a playlist
 * This module defines the playlist schema and associated functionality
 */

const playlistSchema = new Schema(
	{
		// Title of the playlist
		title: {
			type: String,
			trim: true,
			required: [true, 'Playlist title is required'],
			minLength: [1, 'Playlist title must be at least 1 character long'],
			maxLength: [100, 'Playlist title cannot exceed 100 characters'],
		},

		// Optional playlist description
		description: {
			type: String,
			trim: true,
			minLength: [1, "Description doesn't meet minimum length"],
			maxLength: [255, 'Description exceeds 255 characters'],
		},

		// Tracks within the playlist
		tracks: {
			type: [
				{
					type: Schema.Types.ObjectId,
					ref: 'track',
				},
			],
			validate: {
				validator: v => v.length <= 5000,
				message: 'Playlist exceeds 5000 track limit',
			},
		},

		// Visibility setting for the playlist
		visibility: {
			type: String,
			enum: Object.values(VISIBILITY),
			default: 'default',
		},

		// Reference to the owner (user) of the playlist
		owner: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'Owner of the playlist must be specified.'],
		},
	},
	{
		timestamps: true,
	}
);

// Adding a track to the playlist
playlistSchema.methods.addTrack = async function (trackId) {
	if (!this.tracks.includes(trackId)) {
		const trackExists = await Track.exists({ _id: trackId }); // More direct method for existence checking
		if (trackExists) {
			this.tracks.push(trackId);
			await this.save();
		} else {
			throw new Error('Track does not exist');
		}
	} else {
		throw new Error('Track already exists in playlist');
	}
};

// Instance method to remove a track from a playlist
playlistSchema.methods.removeTrack = async function (trackId) {
	try {
		await this.updateOne({ $pull: { tracks: trackId } });
	} catch (error) {
		throw new Error('Track not found in playlist or error removing track');
	}
};

// Indexes for efficient querying
playlistSchema.index({ owner: 1 });

// Composite index for unique title per user
playlistSchema.index({ title: 1, owner: 1 }, { unique: true });

// Compile the model from schema
const Playlist = model('playlist', playlistSchema);

// Export the model
module.exports = Playlist;
