// /server/routes/logRoutes.js

const express = require('express');
const router = express.Router();
const UsageLog = require('../models/UsageLog');

// TODO: We will build this authentication middleware in the next step
const { protect } = require('../middlewares/authMiddleware');

// @route   POST /api/logs
// @desc    Create a new session (contains metadata and empty entries array)
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { aiModel, title } = req.body;

    if (!title) return res.status(400).json({ message: 'Please provide a title for the session.' });

    const session = await UsageLog.create({
      user: req.user.userId,
      aiModel: aiModel || 'Unspecified',
      title,
      entries: [],
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ message: 'Server error while creating session.' });
  }
});

// @route   POST /api/logs/:id/entries
// @desc    Add a prompt/response entry to an existing session
// @access  Private
router.post('/:id/entries', protect, async (req, res) => {
  try {
    const { prompt, response } = req.body;
    const sessionId = req.params.id;

    if (!prompt) return res.status(400).json({ message: 'Please provide a prompt.' });

    const session = await UsageLog.findOne({ _id: sessionId, user: req.user.userId });
    if (!session) return res.status(404).json({ message: 'Session not found.' });

    const entry = { prompt, response };
    session.entries.push(entry);
    await session.save();

    // Return the newly added entry (the last array element)
    const added = session.entries[session.entries.length - 1];
    res.status(201).json(added);
  } catch (error) {
    console.error('Error adding entry:', error);
    res.status(500).json({ message: 'Server error while adding entry.' });
  }
});

// @route   GET /api/logs
// @desc    Get all sessions for the logged-in user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const sessions = await UsageLog.find({ user: req.user.userId }).sort({ updatedAt: -1 });
    res.status(200).json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Server error while fetching sessions.' });
  }
});

// @route GET /api/logs/:id
// @desc  Get a single session by id (including entries)
// @access Private
router.get('/:id', protect, async (req, res) => {
  try {
    const session = await UsageLog.findOne({ _id: req.params.id, user: req.user.userId });
    if (!session) return res.status(404).json({ message: 'Session not found.' });
    res.status(200).json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ message: 'Server error while fetching session.' });
  }
});

module.exports = router;