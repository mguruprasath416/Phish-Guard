const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail, sendResendEmail } = require('../services/emailService');
const { OAuth2Client } = require('google-auth-library');

// ── Helpers ────────────────────────────────────────────────────────────────────

const generateToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'fallback_jwt_secret',
    { expiresIn: '7d' }
  );

const generateVerificationToken = () =>
  crypto.randomBytes(32).toString('hex');

// ── Register ───────────────────────────────────────────────────────────────────

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      if (!existingUser.isVerified) {
        // Already registered but unverified — resend verification
        const token = generateVerificationToken();
        existingUser.verificationToken = token;
        existingUser.tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await existingUser.save();

        try {
          await sendVerificationEmail(email, existingUser.name, token);
          return res.status(200).json({
            success: true,
            message: 'Verification email resent. Please check your inbox.'
          });
        } catch (emailErr) {
          console.error('Email error:', emailErr.message);
          return res.status(200).json({
            success: true,
            message: 'Account exists but unverified. Email service unavailable — check server logs.',
            devToken: token
          });
        }
      }
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token (24h expiry)
    const verificationToken = generateVerificationToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      isVerified: false,
      verificationToken,
      tokenExpiry
    });

    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(email, name.trim(), verificationToken);
      return res.status(201).json({
        success: true,
        message: 'Registration successful! A verification email has been sent to your inbox.'
      });
    } catch (emailErr) {
      console.error('Email sending error:', emailErr.message);
      // Dev fallback — still created the account
      return res.status(201).json({
        success: true,
        message: 'Registration successful! Email service unavailable.',
        devToken: verificationToken // Remove in production
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// ── Verify Email ───────────────────────────────────────────────────────────────

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ error: 'Invalid verification link. Please request a new one.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email is already verified. You can log in.' });
    }

    if (user.tokenExpiry < new Date()) {
      return res.status(400).json({
        error: 'Verification link has expired. Please request a new one.',
        expired: true
      });
    }

    // Mark as verified
    user.isVerified = true;
    user.verifiedAt = new Date();
    user.verificationToken = null;
    user.tokenExpiry = null;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully! You can now log in.'
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Server error during verification' });
  }
};

// ── Resend Verification ────────────────────────────────────────────────────────

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Return generic message to avoid email enumeration
      return res.status(200).json({
        success: true,
        message: 'If this email exists and is unverified, a new link has been sent.'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'This email is already verified. Please log in.' });
    }

    // Rate limiting: max 3 resends per 10 minutes
    const TEN_MINUTES = 10 * 60 * 1000;
    const now = Date.now();

    if (user.lastResendAt && now - user.lastResendAt.getTime() < TEN_MINUTES) {
      if (user.resendCount >= 3) {
        const waitMs = TEN_MINUTES - (now - user.lastResendAt.getTime());
        const waitMin = Math.ceil(waitMs / 60000);
        return res.status(429).json({
          error: `Too many requests. Please wait ${waitMin} minute(s) before trying again.`
        });
      }
      user.resendCount += 1;
    } else {
      // Reset count after cooldown window
      user.resendCount = 1;
      user.lastResendAt = new Date();
    }

    // Generate a fresh token
    const newToken = generateVerificationToken();
    user.verificationToken = newToken;
    user.tokenExpiry = new Date(now + 24 * 60 * 60 * 1000);
    await user.save();

    try {
      await sendResendEmail(email, user.name, newToken);
      return res.json({
        success: true,
        message: 'A new verification email has been sent to your inbox.'
      });
    } catch (emailErr) {
      console.error('Resend email error:', emailErr.message);
      return res.json({
        success: true,
        message: 'Email service unavailable.',
        devToken: newToken
      });
    }
  } catch (error) {
    console.error('Resend error:', error);
    res.status(500).json({ error: 'Server error during resend' });
  }
};

// ── Login ──────────────────────────────────────────────────────────────────────

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        error: 'Please verify your email before logging in.',
        requiresVerification: true,
        email: user.email
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    user.isLoggedIn = true;
    await user.save();

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verifiedAt: user.verifiedAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Server error during login' });
  }
};

// ── Logout ─────────────────────────────────────────────────────────────────────

const logout = async (req, res) => {
  try {
    const { email } = req.body;
    if (email) {
      const user = await User.findOne({ email });
      if (user) {
        user.isLoggedIn = false;
        await user.save();
      }
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error logging out' });
  }
};

// ── Google Login ─────────────────────────────────────────────────────────────

const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'Google ID token is required'
      });
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    let ticket;

    try {
      ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (verifyErr) {
      console.error('Google token verification failed:', verifyErr);

      return res.status(401).json({
        success: false,
        error: 'Invalid Google token'
      });
    }

    const payload = ticket.getPayload();

    console.log('Google Payload:', payload);

    const email = payload?.email;
    const googleId = payload?.sub;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Google account email not found'
      });
    }

    const name =
      payload?.name ||
      payload?.given_name ||
      email.split('@')[0] ||
      'Google User';

    let user = await User.findOne({
      email: email.toLowerCase()
    });

    if (user) {
      // Fix old users with missing names
      if (!user.name || user.name.trim() === '') {
        user.name = name;
      }

      if (!user.googleId) {
        user.googleId = googleId;
      }

      user.authProvider = 'google';
      user.isVerified = true;
      user.isLoggedIn = true;

      await user.save();
    } else {
      user = new User({
        name,
        email: email.toLowerCase(),
        authProvider: 'google',
        googleId,
        isVerified: true,
        verifiedAt: new Date(),
        isLoggedIn: true
      });

      console.log('Creating Google user:', {
        name: user.name,
        email: user.email,
        googleId: user.googleId
      });

      await user.save();
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verifiedAt: user.verifiedAt,
        authProvider: user.authProvider
      }
    });

  } catch (error) {
    console.error('Google Login error:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'Server error during Google login'
    });
  }
};

module.exports = { register, verifyEmail, resendVerification, login, logout, googleLogin };
