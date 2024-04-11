const { Schema } = require('mongoose');
const validator = require('validator');
const { SERVICES } = require('../utils/constants');

/**
 * LinkedService Schema Definition.
 *
 * This schema is designed to manage the integration of various music streaming services with user accounts.
 * It stores information required for accessing the user's music streaming service accounts,
 * including authentication tokens and service-specific user identifiers. Each document represents a link
 * between a user account and a music streaming service, facilitating interaction with the service's API.
 *
 * @module LinkedService
 */

const linkedServiceSchema = new Schema(
	{
		// Streaming service provider (e.g., Spotify, Apple Music)
		serviceName: {
			type: String,
			required: [true, 'Service name is required'],
			enum: {
				values: Object.values(SERVICES),
				message: 'Unsupported service provider',
			},
			lowercase: true,
		},

		// Unique identifier from the provider
		profileId: {
			type: String,
			required: [true, 'Profile ID is required'],
		},

		// Securely stored token for accessing API
		accessToken: {
			type: String,
			required: [true, 'Access token is required'],
		},

		// Securely stored refresh token
		refreshToken: {
			type: String,
			required: [true, 'Refresh token is required'],
		},

		// Expiration date for the access token
		expirationDate: {
			type: Date,
			required: [true, 'Token expiration date is required'],
		},

		// Link to the user profile on the streaming service
		profileLink: {
			type: String,
			validate: [validator.isURL, 'Invalid URL format for profile link'],
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
module.exports = linkedServiceSchema;
