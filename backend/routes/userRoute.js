const express = require('express');
const router = express.Router();

const { registerUser, loginUser, logOutUser } = require('../controller/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logOutUser);

module.exports = router;