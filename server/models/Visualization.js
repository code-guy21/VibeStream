// Import statements
const { Schema, model } = require('mongoose');

//Constants for enums
const { VISIBILITY, SERVICES } = require('../utils/constants');

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

		// Data associated with the visualization
		visualizationData: {
			type: Schema.Types.Mixed,
			required: [true, 'Visualization data is required'],
		},

		// User who created the visualization
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: 'user',
			required: [true, 'The creator of the visualization must be specified.'],
		},

		// Visibility setting for the visualization
		visibility: {
			type: String,
			enum: Object.values(VISIBILITY),
			default: VISIBILITY.DEFAULT,
		},

		// Users who have liked the visualization
		likes: [
			{
				type: Schema.Types.ObjectId,
				ref: 'user',
			},
		],

		// Feedback from users about the visualization
		feedback: [
			{
				type: Schema.Types.ObjectId,
				ref: 'feedback',
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

// Indexes for efficient querying
visualizationSchema.index({ createdBy: 1, songId: 1 });

// Compile model from schema
const Visualization = model('visualization', visualizationSchema);

// Export the model
module.exports = Visualization;
