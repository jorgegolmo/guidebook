// /server/routes/guidelineRoutes.js

const express = require('express');
const router = express.Router();
const Guideline = require('../models/Guideline');

// @route   GET /api/guidelines
// @desc    Get all AI usage guidelines for students
// @access  Public (or Private if you want to force login to read them - we'll keep it simple for now)
router.get('/', async (req, res) => {
  try {
    // Fetch all guidelines from the database.
    // We can sort them by creation date so the newest tips show up first.
    const guidelines = await Guideline.find({}).sort({ createdAt: -1 });

    // Send the array of guidelines back to the client
    res.status(200).json(guidelines);
  } catch (error) {
    console.error('Error fetching guidelines:', error);
    res.status(500).json({ message: 'Server error while fetching guidelines.' });
  }
});

// Note: In a fully fleshed-out system, we would add POST/PUT/DELETE routes here 
// protected by an "Admin/Teacher" middleware role to allow teachers to add new guidelines. 
// For this student-focused MVP, we will assume guidelines are seeded directly into the database.

module.exports = router;