module.exports = {
	spotifyCallback: (req, res) => {
		console.log(req.session.passport);
		res.send('Spotify Logged in!');
	},
};
