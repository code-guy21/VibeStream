const { Schema } = require('mongoose');

//Constants for enums
const { SERVICES } = require('../utils/constants');

// playBackHistory Schema definition
/**
 * Schema to represent playback history in Vibestream application
 * @module playBackHistory
 * @description Handles the schema definition for playback history
 * This module defines the playbackhistory schema and associated functionality
 */

const playbackHistorySchema = new Schema(
	{
		//Unique identifier for the song
		songId: {
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

		// Timestamp indicating when the song was played
		playedAt: {
			type: Date,
			required: [true, 'Playback timestamp required'],
		},

		// References to visualizations associated with the playback
		visualizations: {
			type: [
				{
					type: Schema.Types.ObjectId,
					ref: 'visualization',
				},
			],
			validate: {
				validator: function (value) {
					return value.length <= 10;
				},
				message: 'visualizations exceeds the limit of 10',
			},
		},
	},
	{
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
	}
);

// Export the Schema
module.exports = playbackHistorySchema;
