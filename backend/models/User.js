const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'Google User'
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    default: null
    // Not required for Google OAuth users
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  googleId: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: null
  },
  tokenExpiry: {
    type: Date,
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  isLoggedIn: {
    type: Boolean,
    default: false
  },
  // Rate limiting for resend requests
  lastResendAt: {
    type: Date,
    default: null
  },
  resendCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
