// /server/models/UsageLog.js

const mongoose = require('mongoose');

// Each session contains multiple prompt/response entries and metadata about the AI used
const entrySchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true },
    response: { type: String },
  },
  { timestamps: true }
);

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    aiModel: {
      type: String,
      required: true,
      trim: true,
    },
    entries: [entrySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('UsageLog', sessionSchema);