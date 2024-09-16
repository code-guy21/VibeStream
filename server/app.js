/**
 * Server initialization for the application.
 * Utilizes Express for the web server, Passport for authentication,
 * and MongoDB for session storage.
 *
 * Environment variables are used to configure sensitive and environment-specific options.
 */

// External module imports
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const path = require('path');
const cors = require('cors');
const AWS = require('aws-sdk');

// Internal module imports
const connectDB = require('./config/db'); // MongoDB connection setup
const routes = require('./routes'); // API route definitions
require('./config/passport'); // Passport authentication configuration

// AWS SDK configuration
AWS.config.update({ region: 'us-east-1' });

// Server configuration
const PORT = process.env.PORT || 3001; // Server port assignment

// Express application initialization
const app = express();

// Middleware setup
app.use(express.json()); // JSON parsing middleware

// Function to retrieve secrets and initialize the app
(async () => {
	try {
		// Retrieve secrets from AWS Secrets Manager
		const secrets = await getSecrets();

		// Set environment variables from secrets
		process.env.MONGODB_URI = secrets.MONGODB_URI;
		process.env.SESSION_SECRET = secrets.SESSION_SECRET;
		process.env.CLIENT_URL = secrets.CLIENT_URL;
		process.env.SPOTIFY_CLIENT_ID = secrets.SPOTIFY_CLIENT_ID;
		process.env.SPOTIFY_CLIENT_SECRET = secrets.SPOTIFY_CLIENT_SECRET;
		process.env.SPOTIFY_CALLBACK_URL = secrets.SPOTIFY_CALLBACK_URL;
		process.env.GOOGLE_CLIENT_ID = secrets.GOOGLE_CLIENT_ID;
		process.env.GOOGLE_CLIENT_SECRET = secrets.GOOGLE_CLIENT_SECRET;
		process.env.GOOGLE_CALLBACK_URL = secrets.GOOGLE_CALLBACK_URL;
		process.env.SENDGRID_API_KEY = secrets.SENDGRID_API_KEY;
		process.env.SENDGRID_CALLBACK = secrets.SENDGRID_CALLBACK;
		// Add any other secrets you have stored

		//set trust proxy for deployment
		if (process.env.NODE_ENV === 'production') {
			app.set('trust proxy', 1);
		}

		// Session storage backend initialization
		const sessionStore = MongoStore.create({
			mongoUrl: process.env.MONGODB_URI,
		}); // Session storage backend

		// Session management configuration
		app.use(
			session({
				secret: process.env.SESSION_SECRET || 'default_secret', // Session encryption key
				resave: false, // Avoid resaving sessions that haven't changed
				saveUninitialized: false, // Don't save new sessions that are empty
				store: sessionStore,
				cookie: {
					maxAge: 1000 * 60 * 60 * 24,
					secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
					httpOnly: process.env.NODE_ENV === 'production', // Mitigate XSS attacks by restricting cookie access from JavaScript
					sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Enforce same-site policy for cookies
				},
			})
		);

		// Expose sessionStore for use outside this module
		app.sessionStore = sessionStore;

		// CORS configuration
		app.use(
			cors({
				origin: process.env.CLIENT_URL,
				credentials: true,
			})
		);

		// Passport middleware for authentication
		app.use(passport.initialize());
		app.use(passport.session());

		// Serve static files in production
		if (process.env.NODE_ENV === 'production') {
			app.use(express.static(path.join(__dirname, '../client/build')));
		}

		// Health check endpoint
		app.get('/health', (req, res) => {
			res.status(200).json({ status: 'OK' });
		});

		// Initialize API routes
		app.use(routes);

		// Database connection
		await connectDB();
		console.log('MongoDB successfully connected.');

		// Start the server
		app.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}`));
	} catch (error) {
		console.error('Application initialization failed:', error);
		process.exit(1);
	}
})();

// Function to retrieve secrets from AWS Secrets Manager
async function getSecrets() {
	const secretsManager = new AWS.SecretsManager();
	try {
		const data = await secretsManager
			.getSecretValue({ SecretId: '/vibestream/prod/secrets' })
			.promise();
		let secrets;
		if ('SecretString' in data) {
			secrets = JSON.parse(data.SecretString);
		} else {
			const buff = Buffer.from(data.SecretBinary, 'base64');
			secrets = JSON.parse(buff.toString('ascii'));
		}
		return secrets;
	} catch (err) {
		console.error('Error retrieving secrets from AWS Secrets Manager:', err);
		throw err;
	}
}

module.exports = app;
