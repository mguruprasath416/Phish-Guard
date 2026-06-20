const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  resendVerification,
  login,
  logout,
  googleLogin
} = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/google
router.post('/google', googleLogin);

// POST /api/auth/logout
router.post('/logout', logout);

// GET /api/auth/verify-email/:token
router.get('/verify-email/:token', verifyEmail);

// POST /api/auth/resend-verification
router.post('/resend-verification', resendVerification);

module.exports = router;
