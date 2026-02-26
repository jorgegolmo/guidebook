// /server/server.js

// 1. Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import Route Files
const authRoutes = require('./routes/authRoutes');
const logRoutes = require('./routes/logRoutes');
const guidelineRoutes = require('./routes/guidelineRoutes');

// 2. Initialize the Express application
const app = express();

// 3. Configure Middleware
app.use(cors()); 
app.use(express.json());

// 4. Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-guidebook';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB.');
  })
  .catch((error) => {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1); 
  });

// 5. Mount API Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'AI Guidebook API is running smoothly.' });
});

// Mount the routers to specific URL paths
app.use('/api/auth', authRoutes);         // Handles POST /api/auth/login
app.use('/api/logs', logRoutes);          // Handles GET & POST /api/logs
app.use('/api/guidelines', guidelineRoutes); // Handles GET /api/guidelines

// 6. Start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`Test the health check at: http://localhost:${PORT}/api/health`);
});