// /server/models/UsageLog.js

const mongoose = require('mongoose');

const usageLogSchema = new mongoose.Schema(
  {
    // The 'user' field links this specific log to the student who created it.
    // This is vital for data privacy and filtering dashboard data.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true, // Removes accidental whitespace from the beginning/end
      maxLength: 100, // Keeps topics concise for the UI
    },
    transcript: {
      type: String,
      required: true,
      // We do not set a maxLength here because AI chat transcripts can be very long
    },
  },
  {
    // This automatically adds 'createdAt' and 'updatedAt' fields to every document.
    // 'createdAt' is what we will use to group logs by month for the dashboard chart.
    timestamps: true, 
  }
);

// Compile the schema into a model and export it
module.exports = mongoose.model('UsageLog', usageLogSchema);