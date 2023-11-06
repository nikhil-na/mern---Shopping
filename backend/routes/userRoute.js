const express = require('express');
const router = express.Router();

const { registerUser, loginUser, logOutUser, forgotPassword, resetPassword, getUserProfile, updatePassword, updateUser, allUsers, getUserDetails, updateUserProfile, deleteUser } = require('../controller/authController');

const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logOutUser);
router.post('/password/forgot',forgotPassword);
router.put('/password/reset/:token', resetPassword);

router.get('/me', isAuthenticatedUser, getUserProfile);
router.put('/password/update', isAuthenticatedUser, updatePassword);
router.put('/me/update', isAuthenticatedUser, updateUser);

router.get('/admin/users', isAuthenticatedUser, authorizeRoles('admin'), allUsers);
router.get('/admin/user/:id', isAuthenticatedUser, authorizeRoles('admin'), getUserDetails)
        .put('/admin/user/:id', isAuthenticatedUser, authorizeRoles('admin'), updateUserProfile)
        .delete('/admin/user/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteUser)

module.exports = router;