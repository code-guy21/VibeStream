const express = require('express');
const connectDB = require('./config/db');
const routes = require('./routes');

const PORT = 3001;

const app = express();

app.use(express.json());

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
