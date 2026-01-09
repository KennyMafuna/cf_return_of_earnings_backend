const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyRecaptcha = require('../middleware/recaptcha');
const auth = require('../middleware/auth');

// Public routes
router.post('/check-user', authController.checkUserInfo);
router.post('/register', verifyRecaptcha, authController.register);
router.post('/login', authController.login);
router.post('/admin-login', authController.adminLogin);
router.post('/reset-password', authController.resetPassword);
router.post('/check-user-exists', authController.checkUserExists);
router.post('/forgot-password', authController.forgotPassword);


// Protected routes - Make sure authController.getProfile exists
// If you don't have getProfile, remove this line or create the function
// router.get('/profile', auth, authController.getProfile);

module.exports = router;