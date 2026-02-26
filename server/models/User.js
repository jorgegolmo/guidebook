// /server/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // (or 'bcrypt' depending on what you installed)

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: [true, 'A password is required.'],
    // Here is your custom validation message!
    minlength: [6, 'Oops! Your password is too short. It must be at least 6 characters long.'] 
  }
});

// Pre-save hook to hash the password before saving to the database
// Pre-save hook to hash the password before saving
userSchema.pre('save', async function() {
  // If the password wasn't modified, just exit the function and let Mongoose continue
  if (!this.isModified('password')) {
    return;
  }

  // We don't need a try/catch or next() here! 
  // If an error happens, the async function automatically passes it to Mongoose.
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);