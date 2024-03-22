module.exports = {
	spotifyCallback: (req, res) => {
		console.log(req.user);
		res.send('Spotify Logged in!');
	},
};
