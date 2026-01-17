// index.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Untuk handle Base64 images

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cookedpad', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true,
  retryWrites: true,
  w: 'majority',
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  tlsAllowInvalidCertificates: true
})
  .then(() => console.log('Auth Service: MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// ===== ROUTES =====

// Health Check
app.get('/', (req, res) => {
  res.json({ 
    service: 'Auth Service', 
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Register
app.post('/register', async (req, res) => {
  try {
    const { email, password, username, fullName } = req.body;

    // Validation
    if (!email || !password || !username || !fullName) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email or username already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      username,
      fullName,
      profilePicture: null,
      bio: ''
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        username: user.username
      },
      process.env.JWT_SECRET || 'supersecretkey123',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        username: user.username
      },
      process.env.JWT_SECRET || 'supersecretkey123',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

// Verify Token (for other services)
app.post('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'supersecretkey123'
    );

    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});