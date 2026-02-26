// /server/routes/authRoutes.js

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new student account
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide both username and password.' });
    }

    // 2. Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username is already taken. Please choose another.' });
    }

    // 3. Create the new user 
    // (The plain-text password will be automatically hashed by our Mongoose pre-save hook)
    const newUser = await User.create({
      username,
      password
    });

    // 4. Generate the JSON Web Token (JWT) so they are logged in immediately
    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username },
      process.env.JWT_SECRET || 'fallback_super_secret_key_for_dev', 
      { expiresIn: '1d' }
    );

    // 5. Send success response
    res.status(201).json({
      message: 'Registration successful',
      token: token,
      user: {
        id: newUser._id,
        username: newUser.username
      }
    });

  } catch (error) {
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
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'fallback_super_secret_key_for_dev', 
      { expiresIn: '1d' } 
    );

    res.status(200).json({
      message: 'Login successful',
      token: token,
      user: {
        id: user._id,
        username: user.username
      }
    });

  } catch (error) {
      // 1. Check if it's a Mongoose validation error (like the 6-character limit)
      if (error.name === 'ValidationError') {
        // Extract the first custom validation error message we wrote in User.js
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages[0] });
      }
      
      // 2. Check for duplicate key error (meaning the username is already taken)
      if (error.code === 11000) {
         return res.status(400).json({ message: 'That username is already taken. Please choose another one.' });
      }

      // 3. If it's something else entirely, log it and send a generic message
      console.error("Registration Error:", error);
      res.status(500).json({ message: 'Server error during registration' });
    }
});

module.exports = router;