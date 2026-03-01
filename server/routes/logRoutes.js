// /server/routes/logRoutes.js

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const UsageLog = require('../models/UsageLog');
const { protect } = require('../middlewares/authMiddleware');

// @route   POST /api/logs
// @desc    Create a new session (contains metadata and empty entries array)
// @access  Private
// Limits to avoid extremely large payloads (tune as needed)
const MAX_PROMPT_LENGTH = 5000;
const MAX_RESPONSE_LENGTH = 20000;

// Helper to send a consistent 400 for validation problems
const badRequest = (res, message) => res.status(400).json({ message });

router.post('/', protect, async (req, res) => {
  try {
    const { aiModel, title } = req.body;

    if (!title) return badRequest(res, 'Please provide a title for the session.');

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

    // Validate id early to avoid Mongoose cast errors
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return badRequest(res, 'Invalid session id.');
    }

    if (!prompt) return badRequest(res, 'Please provide a prompt.');

    if (typeof prompt === 'string' && prompt.length > MAX_PROMPT_LENGTH) {
      return badRequest(res, `Prompt too long (max ${MAX_PROMPT_LENGTH} characters).`);
    }
    if (response && typeof response === 'string' && response.length > MAX_RESPONSE_LENGTH) {
      return badRequest(res, `Response too long (max ${MAX_RESPONSE_LENGTH} characters).`);
    }

    // Find the session and ensure it belongs to the requesting user
    const session = await UsageLog.findOne({ _id: sessionId, user: req.user.userId });
    if (!session) return res.status(404).json({ message: 'Session not found.' });

    const entry = { prompt, response };
    session.entries.push(entry);
    await session.save();

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
    const sessionId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return badRequest(res, 'Invalid session id.');
    }

    const session = await UsageLog.findOne({ _id: sessionId, user: req.user.userId });
    if (!session) return res.status(404).json({ message: 'Session not found.' });
    res.status(200).json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ message: 'Server error while fetching session.' });
  }
});

module.exports = router;