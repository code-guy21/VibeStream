const { User } = require('../models');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const transporter = nodemailer.createTransport({
	host: 'smtp.sendgrid.net',
	port: '587',
	secure: false,
	auth: {
		user: 'apikey',
		pass: process.env.SENDGRID_API_KEY,
	},
});

function generateVerificationToken() {
	return crypto.randomBytes(32).toString('hex');
}

async function sendEmail(user) {
	try {
		const mailOptions = {
			from: 'alexissj16@knights.ucf.edu',
			to: user.email,
			subject: 'email verification',
			text: `click this link to verify your account http://localhost:3001/api/auth/verify?token=${user.verificationToken}`,
		};

		const info = await transporter.sendMail(mailOptions);

		console.log(info);
	} catch (error) {
		console.log(error);
	}
}

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
