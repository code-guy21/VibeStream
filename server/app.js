const express = require('express');
const session = require('express-session');
const passport = require('passport');
const connectDB = require('./config/db');
const routes = require('./routes');

require('./config/passport')(passport);

const PORT = 3001;

const app = express();

app.use(
	session({
		secret: 'secret',
		resave: true,
		saveUninitialized: true,
	})
);

app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

app.use(routes);

connectDB()
	.then(() => {
		console.log('MongoDB connected');
		app.listen(PORT, () => {
			console.log('server running on PORT:' + PORT);
		});
	})
	.catch(error => {
		console.log(error);
		process.exit(1);
	});
