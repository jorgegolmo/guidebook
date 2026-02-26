// /server/routes/logRoutes.js

const express = require('express');
const router = express.Router();
const UsageLog = require('../models/UsageLog');

// TODO: We will build this authentication middleware in the next step
const { protect } = require('../middlewares/authMiddleware');

// @route   POST /api/logs
// @desc    Create a new AI usage log
// @access  Private (Requires valid JWT token)
router.post('/', protect, async (req, res) => {
  try {
    const { topic, transcript } = req.body;

    if (!topic || !transcript) {
      return res.status(400).json({ message: 'Please provide both a topic and transcript.' });
    }

    // Create a new log entry.
    // 'req.user.userId' is provided by the 'protect' middleware after validating the token.
    const newLog = await UsageLog.create({
      user: req.user.userId,
      topic,
      transcript,
    });

    res.status(201).json(newLog);
  } catch (error) {
    console.error('Error saving usage log:', error);
    res.status(500).json({ message: 'Server error while saving log.' });
  }
});

// @route   GET /api/logs
// @desc    Get all AI usage logs for the logged-in student
// @access  Private (Requires valid JWT token)
router.get('/', protect, async (req, res) => {
  try {
    // Find all logs that belong to this specific user ID.
    // .sort({ createdAt: -1 }) ensures the newest logs appear first on the dashboard.
    const logs = await UsageLog.find({ user: req.user.userId }).sort({ createdAt: -1 });

    res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Server error while fetching logs.' });
  }
});

module.exports = router;