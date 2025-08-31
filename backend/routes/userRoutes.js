const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const keys = require('../config/keys');
const logger = require('../utils/logger');

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, profile } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role,
      profile
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      keys.jwtSecret,
      { expiresIn: keys.jwtExpire }
    );

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    logger.error('User registration failed:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Find user by email
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check role
    if (user.role !== role) {
      return res.status(401).json({
        success: false,
        message: 'Invalid role for this account'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      keys.jwtSecret,
      { expiresIn: keys.jwtExpire }
    );

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    logger.error('User login failed:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Failed to get user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data'
    });
  }
});

// Update user profile
router.patch('/profile', auth, async (req, res) => {
  try {
    const { name, profile } = req.body;
    const userId = req.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, profile },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });

  } catch (error) {
    logger.error('Profile update failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

module.exports = router;