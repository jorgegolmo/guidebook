// /server/routes/authRoutes.js

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

const router = express.Router();

// --- Helper Function ---
// Extracts token generation to prevent DRY violations and ensure consistent expiration times
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, username: user.username },
    process.env.JWT_SECRET || 'fallback_super_secret_key_for_dev', 
    { expiresIn: '1d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new student account
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide both username and password.' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username is already taken. Please choose another.' });
    }

    // Create the new user (Password hashed automatically by User model pre-save hook)
    const newUser = await User.create({ username, password });

    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Registration successful',
      token: token,
      user: {
        id: newUser._id,
        username: newUser.username
      }
    });

  } catch (error) {
    // Handle Mongoose validation errors (e.g., password too short)
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages[0] });
    }
    
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});


// @route   POST /api/auth/login
// @desc    Authenticate a user and return a JWT
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide both username and password.' });
    }

    const user = await User.findOne({ username });
    
    // Security Fix: Prevent Username Enumeration. 
    // Do not reveal whether the username exists or if the password was just wrong.
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    // Refactoring Fix: Use the Domain Model's method instead of raw bcrypt here
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      token: token,
      user: {
        id: user._id,
        username: user.username
      }
    });

  } catch (error) {
    // Bug Fix: Removed the copy-pasted registration error handling.
    console.error("Login Error:", error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;