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

module.exports = { generateVerificationToken, sendEmail };
