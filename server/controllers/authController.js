const { User } = require('../models');
const bcrypt = require('bcrypt');

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
			});

			const { password: extractedPassword, ...userWithoutPassword } =
				user.toObject();

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
};
