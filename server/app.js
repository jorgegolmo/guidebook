// server/app.js
'use strict';

const express         = require('express');
const cors            = require('cors');

const authRoutes      = require('./routes/authRoutes');
const logRoutes       = require('./routes/logRoutes');
const guidelineRoutes = require('./routes/guidelineRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.status(200).json({ message: 'AI Guidebook API is running smoothly.' });
});

app.use('/api/auth',       authRoutes);
app.use('/api/logs',       logRoutes);
app.use('/api/guidelines', guidelineRoutes);

module.exports = app;
