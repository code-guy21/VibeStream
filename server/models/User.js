// Import statements
const { Schema, model } = require('mongoose');
const validator = require('validator');

// Constants for enums
const VISIBILITY_OPTIONS = ['public', 'private', 'followersOnly'];

// User Schema definition
/**
 * Schema to represent a User in VibeStream application
 * @module UserModel
 * @description Handles the schema definition for a user.
 * This module defines the user schema and associated functionality.
 */
const userSchema = new Schema(
	{
		//User identifier for internal and login purposes
		username: {
			type: String,
			required: [true, 'Username is required'],
			trim: true,
			unique: true,
			lowercase: true,
			validate: [
				validator.isAlphanumeric,
				'Username contains invalid characters',
			],
		},
		// Display name for public facing profile
		displayName: {
			type: String,
			required: true,
			trim: true,
			maxLength: [50, 'Display name cannot exceed 50 characters'],
		},
		// User email for identification and communication
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true,
			trim: true,
			lowercase: true,
			validate: [validator.isEmail, 'Please provide a valid email address'],
		},
		profileImage: {
			type: String,
			trim: true,
			validate: [validator.isURL, 'Invalid URL format for profile image'],
		},
		bio: {
			type: String,
			trim: true,
			maxLength: [160, 'Bio cannot exceed 160 characters'],
		},
		globalPlaylistVisibility: {
			type: String,
			enum: VISIBILITY_OPTIONS,
			default: 'public',
		},
		globalVisualizationVisibility: {
			type: String,
			enum: VISIBILITY_OPTIONS,
			default: 'public',
		},
		authMethods: [
			{
				type: Schema.Types.ObjectId,
				ref: 'auth',
			},
		],
		likedVisualizations: [
			{
				type: Schema.Types.ObjectId,
				ref: 'visualization',
			},
		],
		createdVisualizations: [
			{
				type: Schema.Types.ObjectId,
				ref: 'visualization',
			},
		],
		playlists: [
			{
				type: Schema.Types.ObjectId,
				ref: 'playlist',
			},
		],
		following: [
			{
				type: Schema.Types.ObjectId,
				ref: 'user',
			},
		],
		followers: [
			{
				type: Schema.Types.ObjectId,
				ref: 'user',
			},
		],
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

// Indexes for unique fields
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });

// Compile model from schema
const User = model('user', userSchema);

module.exports = User;
