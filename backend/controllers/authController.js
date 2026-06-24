const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Freelancer = require('../models/Freelancer');
const Client = require('../models/Client');
const sendEmail = require('../utils/sendEmail');
const totp = require('../utils/totp');

// Generate Access Token
const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m'
  });
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
  });
};

// Send Token response (set cookie)
const sendTokenResponse = async (user, statusCode, res) => {
  const token = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Update refresh token in DB
  await User.findByIdAndUpdate(user._id, { refreshToken });

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        isTwoFactorEnabled: user.isTwoFactorEnabled
      }
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, coordinates, address } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    const verificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create user
    user = await User.create({
      name,
      email,
      password,
      role,
      emailVerificationToken: verificationToken,
      emailVerificationExpire: verificationExpire
    });

    const parsedCoordinates = coordinates || [0, 0];

    // Create specific profile based on role
    if (role === 'freelancer') {
      await Freelancer.create({
        user: user._id,
        hourlyRate: 30, // Default hourly rate
        location: {
          type: 'Point',
          coordinates: parsedCoordinates,
          address: address || ''
        }
      });
    } else if (role === 'client') {
      await Client.create({
        user: user._id,
        location: {
          type: 'Point',
          coordinates: parsedCoordinates,
          address: address || ''
        }
      });
    }

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    const message = `Please verify your email by clicking the link: \n\n ${verificationUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'SkillSphere - Email Verification',
        message
      });
    } catch (err) {
      console.error('Verification email failed to send', err);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Verification email sent.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password +twoFactorSecret');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if 2FA enabled
    if (user.isTwoFactorEnabled) {
      // Generate a temporary 2FA token valid for 5 mins
      const tempToken = jwt.sign({ id: user._id, temp: true }, process.env.JWT_SECRET, {
        expiresIn: '5m'
      });
      return res.status(200).json({
        success: true,
        twoFactorRequired: true,
        tempToken
      });
    }

    await sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Verify 2FA Code
// @route   POST /api/auth/verify-2fa
// @access  Public (Requires tempToken)
exports.verify2FA = async (req, res, next) => {
  try {
    const { code, tempToken } = req.body;

    if (!code || !tempToken) {
      return res.status(400).json({ success: false, message: 'OTP code and temporary session token are required' });
    }

    // Decode temp token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (!decoded.temp) {
      return res.status(401).json({ success: false, message: 'Invalid verification token' });
    }

    const user = await User.findById(decoded.id).select('+twoFactorSecret');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const verified = totp.verifyTOTP(code, user.twoFactorSecret);
    if (!verified) {
      return res.status(400).json({ success: false, message: 'Invalid 2FA OTP code' });
    }

    await sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(401).json({ success: false, message: 'Session expired or invalid token' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { refreshToken: '' });
    res
      .status(200)
      .cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
      })
      .json({
        success: true,
        message: 'Logged out successfully'
      });
  } catch (err) {
    next(err);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }

    const user = await User.findOne({ refreshToken: token });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    // Verify token
    try {
      jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Refresh token expired or invalid' });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user);
    res.status(200).json({
      success: true,
      token: newAccessToken
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify email address
// @route   GET /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found with this email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send email
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    const message = `You requested a password reset. Please click: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'SkillSphere - Password Reset',
        message
      });
      res.status(200).json({ success: true, message: 'Email sent' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful!' });
  } catch (err) {
    next(err);
  }
};

// @desc    Enable Two-Factor Authentication
// @route   POST /api/auth/enable-2fa
// @access  Private
exports.enable2FA = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const secret = totp.generateSecret();

    user.twoFactorSecret = secret;
    user.isTwoFactorEnabled = true;
    await user.save();

    res.status(200).json({
      success: true,
      secret,
      message: '2FA enabled. Please configure your authenticator app using this secret.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Disable Two-Factor Authentication
// @route   POST /api/auth/disable-2fa
// @access  Private
exports.disable2FA = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: '2FA disabled successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Google login endpoint
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res, next) => {
  try {
    const { googleId, email, name, avatar, role } = req.body;

    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.findOne({ email });
    }

    if (!user) {
      // Create user
      user = await User.create({
        name,
        email,
        googleId,
        avatar,
        role: role || 'freelancer', // Default role if register
        isEmailVerified: true
      });

      // Create profile
      if (user.role === 'freelancer') {
        await Freelancer.create({ user: user._id, hourlyRate: 30 });
      } else if (user.role === 'client') {
        await Client.create({ user: user._id });
      }
    } else if (!user.googleId) {
      // Link Google Account
      user.googleId = googleId;
      if (avatar && !user.avatar) user.avatar = avatar;
      await user.save();
    }

    await sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};
