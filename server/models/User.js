const { Schema, model } = require('mongoose');
const validator = require('validator');
const playbackHistorySchema = require('./PlaybackHistory');
const authSchema = require('./Auth');
const linkedServiceSchema = require('./LinkedService');
const bcrypt = require('bcrypt');

const { VISIBILITY } = require('../utils/constants');

/**
 * Defines schema for users within the VibeStream application.
 * This schema encompasses various aspects of a user's profile, including
 * authentication methods, linked streaming services, and content interactions.
 * It serves as a model for user data management and interactions.
 *
 * @module UserModel
 */
const userSchema = new Schema(
	{
		// Username for login and internal identification
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
		// User's display name for public profile
		displayName: {
			type: String,
			required: [true, 'Display name is required.'],
			trim: true,
			maxLength: [50, 'Display name cannot exceed 50 characters'],
		},
		// User email for identification and communication
		email: {
			type: String,
			required: [true, 'Email address is required.'],
			unique: true,
			trim: true,
			lowercase: true,
			validate: [validator.isEmail, 'Invalid email address'],
		},
		password: {
			type: String,
			trim: true,
			minLength: [8, 'Password must be at least 8 characters long'],
		},
		verificationToken: {
			type: String,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		// URL to the user's profile image
		profileImage: {
			type: String,
			trim: true,
			validate: [validator.isURL, 'Invalid URL for profile image'],
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

		// Authentication methods linked to user
		authMethods: [authSchema],

		// Streaming services linked to user
		linkedServices: [linkedServiceSchema],

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
		playbackHistory: {
			type: [playbackHistorySchema],
			validate: {
				validator: history => history.length <= 500,
				message: 'playback history cannot exceed 500 entries',
			},
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

userSchema.pre('save', async function (next) {
	if (this.password) {
		if (this.isModified('password') || this.isNew) {
			try {
				const salt = await bcrypt.genSalt(10);
				this.password = await bcrypt.hash(this.password, salt);
				next();
			} catch (err) {
				next(err);
			}
		}
	} else {
		next();
	}
});

userSchema.methods.toJSON = function () {
	let obj = this.toObject();
	delete obj.password;
	delete obj.isVerified;
	delete obj.verificationToken;
	delete obj.__v;
	return obj;
};

// Instance method to add or update tracks in playbackHistory
userSchema.methods.updateOrAddPlaybackHistory = async function (
	songId,
	platform,
	visualizationId
) {
	try {
		const playbackEntry = this.playbackHistory.find(
			entry => entry.songId === songId
		);

		if (playbackEntry) {
			playbackEntry.playedAt = new Date();
			if (!playbackEntry.visualizations.includes(visualizationId)) {
				if (playbackEntry.visualizations.length >= 10) {
					playbackEntry.visualizations.shift();
				}
				// Remove the oldest visualization if at limit
				playbackEntry.visualizations.push(visualizationId); // Add the new visualization
			}
		} else {
			// Add new playback history entry
			this.playbackHistory.push({
				songId,
				platform,
				playedAt: new Date(),
				visualizations: [visualizationId],
			});
		}

		await this.save();
	} catch (error) {
		console.error('Error updating playback history for user:', this._id, error);
		throw new Error('Failed to update playback history.');
	}
};

// Instance method to clear playback history
userSchema.methods.clearPlaybackHistory = async function () {
	try {
		this.playbackHistory = [];
		await this.save();
	} catch (error) {
		throw error;
	}
};

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

// Export the model
module.exports = User;
