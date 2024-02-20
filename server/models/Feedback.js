const { Schema, model } = require('mongoose');
const sanitizeHtml = require('sanitize-html');
const BadWordsFilter = require('bad-words');

const filter = new BadWordsFilter();

// Feedback Schema definition
/**
 * @module FeedbackModel
 * @description Handles the schema definition for a feedback s
 * This module defines the feedback schema and associated functionality
 */

const feedbackSchema = new Schema(
	{
		// Numerical rating associated with the feedback, ranging from 1 to 5
		rating: {
			type: Number,
			required: [true, 'A numerical rating is required.'],
			min: [1, 'Rating must be at least 1.'],
			max: [5, 'Rating cannot exceed 5.'],
		},

		// Optional comment providing additional feedback details
		comment: {
			type: String,
			trim: true,
			maxLength: [150, 'Comment cannot exceed 150 characters'],
		},

		// Reference to the user who submitted the feedback
		submittedBy: {
			type: Schema.Types.ObjectId,
			required: [true, 'Feedback must be associated with a user.'],
			ref: 'user',
		},

		// Reference to the visualization the feedback is related to
		relatedVisualization: {
			type: Schema.Types.ObjectId,
			required: [true, 'Feedback must be associated with a visualization.'],
			ref: 'visualization',
		},
	},
	{
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
	}
);

// Pre-save hook to clean up and secure user-generated content.
// This includes removing any HTML to prevent XSS attacks and filtering profanity to maintain a respectful community environment.
feedbackSchema.pre('save', async function (next) {
	try {
		if (this.comment) {
			// Sanitizing the comment to remove all HTML tags and attributes
			this.comment = sanitizeHtml(this.comment, {
				allowedTags: [], // No HTML tags are allowed
				allowedAttributes: {}, // No attributes are allowed
			});

			// Filtering out profanity from the comment
			this.comment = filter.clean(this.comment);
		}
	} catch (error) {
		next(error);
	}
	next();
});

// Indexes for efficient querying
feedbackSchema.index(
	{ submittedBy: 1, relatedVisualization: 1 },
	{ unique: true }
);

// Compile model from schema
const Feedback = model('feedback', feedbackSchema);

// Export the model
module.exports = Feedback;
