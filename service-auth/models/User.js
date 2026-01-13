// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  username: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  fullName: { 
    type: String, 
    required: true 
  },
  profilePicture: {
    type: String, // Base64 string
    default: null
  },
  bio: { 
    type: String, 
    default: '' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('User', userSchema);