const { Schema, model } = require('mongoose');

const { SERVICES } = require('../utils/constants');

// Track Schema definition
/**
 * Schema to represent Tracks in Vibestream application
 * @module Track
 * @description Handles the schema definition for Tracks
 * This module defines the Track schema and associated functionality
 */

const trackSchema = new Schema(
	{
		//Unique identifier for the song
		trackId: {
			type: String,
			required: [true, 'Song ID is required'],
		},
		// Platform from which the song is taken
		platform: {
			type: String,
			required: [true, 'The music platform is required.'],
			enum: Object.values(SERVICES),
			validate: {
				validator: v => {
					return Object.values(SERVICES).includes(v.toLowerCase());
				},
				message: props => `${props.value} is not a supported music platform.`,
			},
			// Ensuring platform is stored in lowercase
			set: v => v.toLowerCase(),
		},

		// Whether the track is playable or not
		enabled: {
			type: Boolean,
			required: [true, 'Enabled option is required'],
			default: true,
		},
	},
	{
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
	}
);

// Index for efficient querying of tracks that belong to a specific platform
trackSchema.index({ trackId: 1, platform: 1 }, { unique: true });

const Track = model('track', trackSchema);

// Export the Schema
module.exports = Track;
