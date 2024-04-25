const { User } = require('../models');
const { generateVerificationToken, sendEmail } = require('../utils/email');

module.exports = {
	googleCallback: (req, res) => {
		// console.log(req.user);
		res.send('Google Logged in!');
	},
	registerUser: async (req, res) => {
		try {
			let { username, displayName, email, password, profileImage } = req.body;

			let user = await User.findOne({ email });

			if (user) {
				return res
					.status(400)
					.json({ message: 'Account with this email already exists' });
			}

			user = await User.create({
				username,
				displayName,
				email,
				password,
				profileImage,
				verificationToken: generateVerificationToken(),
			});

			const { password: extractedPassword, ...userWithoutPassword } =
				user.toObject();

			await sendEmail(user);

			res
				.status(200)
				.json({ message: 'User registered', user: userWithoutPassword });
		} catch (error) {
			res
				.status(500)
				.json({ error: 'Internal Server Error', details: error.message });
		}
	},
	spotifyCallback: async (req, res) => {
		res.send('spotify callback');
	},
	loginUser: async (req, res) => {
		res.status(200).json({ message: 'Logged in!' });
	},
	verifyUser: async (req, res) => {
		try {
			let token = req.query.token;
			let user = await User.findOne({ verificationToken: token });

			if (!user) {
				return res.status(400).json({ message: 'verification failed' });
			}

			user.verificationToken = null;
			user.isVerified = true;

			await user.save();

			res.status(200).json({ message: 'user has been verified' });
		} catch (error) {
			res
				.status(500)
				.json({ message: 'Interval Server Error', error: error.message });
		}
	},
};
