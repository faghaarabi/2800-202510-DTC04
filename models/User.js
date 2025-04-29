const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  interests: [{
    type: String,
    trim: true
  }],
  connectionGoals: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500
  },
  location: {
    type: String,
    trim: true
  },
  age: {
    type: Number,
    min: 18,
    max: 100
  },
  profilePicture: {
    type: String,
    default: '/default-profile.png'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);