// /server/models/Guideline.js

const mongoose = require('mongoose');

const guidelineSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A guideline must have a title'],
      trim: true,
      maxLength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'A guideline must have a description'],
      trim: true,
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

module.exports = mongoose.model('Guideline', guidelineSchema);
