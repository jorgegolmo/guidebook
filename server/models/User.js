// /server/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: [true, 'A password is required.'],
    minlength: [6, 'Oops! Your password is too short. It must be at least 6 characters long.'] 
  }
});

// Hash the password before saving to the database
userSchema.pre('save', async function() {
  // If the password wasn't modified, just exit the function
  if (!this.isModified('password')) {
    return;
  }

  // Mongoose automatically catches errors inside async hooks, so try/catch/next are not needed here.
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Encapsulate password verification logic within the model
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);