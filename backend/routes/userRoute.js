const express = require('express');
const router = express.Router();

const { registerUser, loginUser, logOutUser, forgotPassword, resetPassword } = require('../controller/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logOutUser);
router.post('/password/forgot',forgotPassword);
router.put('/password/reset/:token', resetPassword);

module.exports = router;