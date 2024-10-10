// server/routes/users.js
const express = require('express');
const { getUser, updateUser } = require('../controllers/userController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/:id', getUser);
router.put('/:id', updateUser);

module.exports = router;