const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  interests: [String],
  connectionGoals: [String],
  // Add more fields as per project requirements
});

module.exports = mongoose.model('User', UserSchema);