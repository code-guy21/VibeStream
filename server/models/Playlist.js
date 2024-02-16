// Import statements
const { Schema, model } = require('mongoose');

// Constants for enums
const { PLAYLIST_TYPES, VISIBILITY, PLATFORMS } = require('../utils/constants');

// Playlist Schema definition
/**
 * Schema to represent a Playlist in VibeStream application
 * @module PlaylistModel
 * @description Handles the schema definition for a playlist
 * This module defines the playlist schema and associated functionality
 */

const playlistSchema = new Schema(
	{
		// Unique identifier for the playlist from the platform
		platformPlaylistId: {
			type: String,
			required: [true, 'Platform playlist ID required'],
		},

		// Platform for which the playlist belongs
		platform: {
			type: String,
			required: [true, 'Playlist platform is required.'],
			validate: {
				validator: v => {
					return Object.values(PLATFORMS).includes(v.toLowerCase());
				},
				message: props => `${props.value} is not a supported music platform.`,
			},
			// Ensuring platform is stored in lowercase
			set: v => v.toLowerCase(),
		},

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

		// Track IDs within the playlist
		trackIds: {
			type: [String],
			validate: {
				validator: v => v.length <= 5000,
				message: 'Playlist exceeds 5000 song limit',
			},
		},

		// Visibility setting for the playlist
		visibility: {
			type: String,
			enum: Object.values(VISIBILITY),
			default: VISIBILITY.DEFAULT,
		},

		// Type of the playlist
		playlistType: {
			type: String,
			enum: Object.values(PLAYLIST_TYPES),
			default: PLAYLIST_TYPES.VIBESTREAM,
		},

		// Whether the playlist should sync with the platform
		syncWithPlatform: {
			type: Boolean,
			required: [true, 'Sync option is required'],
			default: false,
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

// Instance method to add a track to the playlist
playlistSchema.methods.addTrack = async function (track) {
	if (!this.trackIds.includes(track)) {
		this.trackIds.push(track);
		try {
			await this.save();
		} catch (error) {
			throw error;
		}
	}
};

// Instance method to remove a track from a playlist
playlistSchema.methods.removeTrack = async function (track) {
	this.trackIds = this.trackIds.filter(id => id !== track);
	try {
		await this.save();
	} catch (error) {
		throw error;
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
