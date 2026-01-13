// index.js
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cookedpad')
  .then(() => console.log('Users Service: MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Auth Middleware
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'supersecretkey123'
    );

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

// ===== ROUTES =====

// Health Check
app.get('/', (req, res) => {
  res.json({ 
    service: 'Users Service', 
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Get user profile
app.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Update user profile
app.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, bio } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (fullName !== undefined) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;
    user.updatedAt = Date.now();
    
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Update profile picture (Base64)
app.put('/profile/picture', authenticateToken, async (req, res) => {
  try {
    const { profilePicture } = req.body;
    
    if (!profilePicture) {
      return res.status(400).json({ 
        success: false, 
        message: 'Profile picture is required' 
      });
    }
    
    const user = await User.findById(req.user._id);
    user.profilePicture = profilePicture;
    user.updatedAt = Date.now();
    
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Change password
app.put('/profile/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const bcrypt = require('bcryptjs');
    const user = await User.findById(req.user._id);
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.updatedAt = Date.now();
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get user by ID (public)
app.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password -email');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Users Service running on port ${PORT}`);
});