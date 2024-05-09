const router = require('express').Router();
const userRoutes = require('./users');
const authRoutes = require('./auth');
const spotifyRoutes = require('./spotify');

router.use('/user', userRoutes);
router.use('/spotify', spotifyRoutes);
router.use('/auth', authRoutes);

module.exports = router;
