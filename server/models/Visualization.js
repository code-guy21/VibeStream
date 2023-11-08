// Import statements
const { Schema, model } = require('mongoose');

//Constants for enums
const { VISIBILITY, PLATFORMS } = require('../utils/constants');

// Visualization Schema definition
/**
 * Schema to represent a Visualization in VibeStream application
 * @module VisualizationModel
 * @description Handles the schema definition for a visualization
 * This module defines the visualization schema and associated functionality
 */

const visualizationSchema = new Schema(
	{
		// Unique identifier for the song from the platform
		songId: {
			type: String,
			required: [true, 'Song ID is required'],
		},

		// Platform from which the song is taken
		platform: {
			type: String,
			required: [true, 'Platform is required'],
			validate: {
				validator: v => {
					return Object.values(PLATFORMS).includes(v.toLowerCase());
				},
				message: props => `${props.value} is not a valid platform`,
			},
			// Ensuring platform is stored in lowercase
			set: v => v.toLowerCase(),
		},

		// Data associated with the visualization
		visualizationData: {
			type: Schema.Types.Mixed,
			required: [true, 'Visualization data is required'],
		},

		// Reference to the user who created the visualization
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: 'user',
			required: [true, 'User is required'],
		},

		// Visibility setting for the visualization
		visibility: {
			type: String,
			enum: Object.values(VISIBILITY),
			default: VISIBILITY.DEFAULT,
		},

		// Count of likes for the visualization
		likes: {
			type: Number,
			default: 0,
		},

		// Array of feedback objects related to the visualization
		feedback: [
			{
				type: Schema.Types.ObjectId,
				ref: 'feedback',
			},
		],

		// Array of recent songs played by the user
		recentSongs: [
			{
				type: Schema.Types.ObjectId,
				ref: 'playbackhistory',
			},
		],
	},
	{
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
	}
);

// Compile model from schema
const Visualization = model('visualization', visualizationSchema);

// Export the model
module.exports = Visualization;
