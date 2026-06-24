const express = require('express');
const {
  register,
  login,
  verify2FA,
  getMe,
  logout,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  enable2FA,
  disable2FA,
  googleLogin
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');
const { registerValidation, loginValidation, validate } = require('../middleware/validator');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/verify-2fa', verify2FA);
router.post('/refresh', refreshToken);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password', resetPassword);
router.post('/google', googleLogin);

// Protected routes
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);
router.post('/enable-2fa', protect, enable2FA);
router.post('/disable-2fa', protect, disable2FA);

module.exports = router;
