// Import statements
const { Schema, model } = require('mongoose');
const validator = require('validator');

// Constants for enums
const { VISIBILITY } = require('../utils/constants');

// User Schema definition
/**
 * Schema to represent a User in VibeStream application
 * @module UserModel
 * @description Handles the schema definition for a user.
 * This module defines the user schema and associated functionality.
 */
const userSchema = new Schema(
	{
		// Username for login and internal identification
		username: {
			type: String,
			required: [true, 'A username is required'],
			trim: true,
			unique: true,
			lowercase: true,
			validate: [
				validator.isAlphanumeric,
				'Username contains invalid characters',
			],
		},
		// User's display name for public profile
		displayName: {
			type: String,
			required: [true, 'A display name is required.'],
			trim: true,
			maxLength: [50, 'Display name cannot exceed 50 characters'],
		},
		// User email for identification and communication
		email: {
			type: String,
			required: [true, 'An email address is required.'],
			unique: true,
			trim: true,
			lowercase: true,
			validate: [validator.isEmail, 'Please provide a valid email address'],
		},
		// URL to the user's profile image
		profileImage: {
			type: String,
			trim: true,
			validate: [validator.isURL, 'Invalid URL format for profile image'],
		},
		// User's bio
		bio: {
			type: String,
			trim: true,
			maxLength: [160, 'Bio cannot exceed 160 characters'],
		},
		// Default visibility for user's playlists
		globalPlaylistVisibility: {
			type: String,
			enum: Object.values(VISIBILITY),
			default: VISIBILITY.PUBLIC,
		},
		// Default visibility for user's visualizations
		globalVisualizationVisibility: {
			type: String,
			enum: Object.values(VISIBILITY),
			default: VISIBILITY.PUBLIC,
		},
		// Authentication methods linked to the user
		authMethods: [
			{
				type: Schema.Types.ObjectId,
				ref: 'auth',
			},
		],
		// Visualizations the user has liked
		likedVisualizations: [
			{
				type: Schema.Types.ObjectId,
				ref: 'visualization',
			},
		],
		// Visualizations created by the user
		createdVisualizations: [
			{
				type: Schema.Types.ObjectId,
				ref: 'visualization',
			},
		],
		// Playlists curated by the user
		playlists: [
			{
				type: Schema.Types.ObjectId,
				ref: 'playlist',
			},
		],
		// Users that the current user is following
		following: [
			{
				type: Schema.Types.ObjectId,
				ref: 'user',
			},
		],
		// Users that follow the current user
		followers: [
			{
				type: Schema.Types.ObjectId,
				ref: 'user',
			},
		],
		// Playback history of the user
		playbackHistory: [
			{
				type: Schema.Types.ObjectId,
				ref: 'playbackhistory',
			},
		],
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

// Virtual field for follower count
userSchema.virtual('followerCount').get(function () {
	return this.followers.length;
});

// Virtual field for following count
userSchema.virtual('followingCount').get(function () {
	return this.following.length;
});

// Indexes for efficient querying
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });

// Compile model from schema
const User = model('user', userSchema);

module.exports = User;
