const router = require('express').Router();
const { getUsers } = require('../../controllers/usersController');

router.route('/').get(getUsers);

module.exports = router;
