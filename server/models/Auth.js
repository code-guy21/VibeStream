const { Schema, model } = require('mongoose');

const validator = require('validator');

// Constants for enums
const { PLATFORMS } = require('../utils/constants');

/** Auth Schema definition
 * @module Auth
 * @description Handles the schema definition for Auth
 * This module defines the Auth schema and associated functionality
 */

const authSchema = new Schema(
	{
		// Authentication provider (e.g., Spotify, Apple Music)
		authProvider: {
			type: String,
			required: [true, 'Authentication provider is required'],
			enum: Object.values(PLATFORMS),
			validate: [
				v => Object.values(PLATFORMS).includes(v.toLowerCase()),
				'Unsupported authentication provider',
			],
			set: v => v.toLowerCase(),
		},

		// Unique identifier from the authentication provider
		profileId: {
			type: String,
			required: [true, 'Profile ID is required'],
		},

		// Securely stored token for user authentication
		encryptedAuthToken: {
			type: String,
			required: [true, 'Encrypted authentication token is required'],
		},

		// Securely stored refresh token for maintaining user sessions
		encryptedRefreshToken: {
			type: String,
			required: [true, 'Encrypted refresh token is required'],
		},

		// Expiration date for the authentication token
		expirationDate: {
			type: Date,
			required: [true, 'Token expiration date is required'],
		},

		// Link to the user profile on the authentication provider's platform
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

// Complile model from Schema
const Auth = model('auth', authSchema);

// Export the model
module.exports = Auth;
