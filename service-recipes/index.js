// index.js
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const Recipe = require('./models/Recipe');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Untuk handle Base64 images

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
  .then(() => console.log('Recipes Service: MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Auth Middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.slice(7); // Remove 'Bearer '
    
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'supersecretkey123'
    );

    if (!decoded.userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token structure' 
      });
    }

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
    console.error('Authentication error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token format' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    
    res.status(401).json({ 
      success: false, 
      message: 'Authentication failed' 
    });
  }
};

// ===== ROUTES =====

// Health Check
app.get('/', (req, res) => {
  res.json({ 
    service: 'Recipes Service', 
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Get all recipes (with pagination)
app.get('/recipes', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    
    let query = {};
    if (category) {
      query.category = category;
    }
    
    const recipes = await Recipe.find(query)
      .populate('author', 'username fullName profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Recipe.countDocuments(query);
    
    res.json({
      success: true,
      recipes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get single recipe
app.get('/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('author', 'username fullName profilePicture')
      .populate('likes', 'username')
      .populate('saves', 'username');
    
    if (!recipe) {
      return res.status(404).json({ 
        success: false, 
        message: 'Recipe not found' 
      });
    }
    
    res.json({
      success: true,
      recipe
    });
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Update recipe
app.put('/recipes/:id', authenticateToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ 
        success: false, 
        message: 'Recipe not found' 
      });
    }

    // Check if user is the author
    if (recipe.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    const {
      title,
      description,
      ingredients,
      instructions,
      category,
      prepTime,
      cookTime,
      servings,
      difficulty,
      images,
      youtubeUrl
    } = req.body;

    // Update fields
    if (title) recipe.title = title;
    if (description) recipe.description = description;
    if (ingredients) recipe.ingredients = ingredients;
    if (instructions) recipe.instructions = instructions;
    if (category) recipe.category = category;
    if (prepTime !== undefined) recipe.prepTime = prepTime;
    if (cookTime !== undefined) recipe.cookTime = cookTime;
    if (servings !== undefined) recipe.servings = servings;
    if (difficulty) recipe.difficulty = difficulty;
    if (images) recipe.images = images;
    if (youtubeUrl !== undefined) recipe.youtubeUrl = youtubeUrl;
    recipe.updatedAt = Date.now();

    await recipe.save();

    res.json({
      success: true,
      message: 'Recipe updated successfully',
      recipe
    });
  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Create recipe
app.post('/recipes', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      ingredients,
      instructions,
      category,
      prepTime,
      cookTime,
      servings,
      difficulty,
      images,
      youtubeUrl
    } = req.body;
    
    // Validation
    if (!title || !description || !ingredients || !instructions) {
      return res.status(400).json({ 
        success: false, 
        message: 'Required fields are missing' 
      });
    }
    
    const recipe = new Recipe({
      title,
      description,
      ingredients,
      instructions,
      category: category || 'makanan',
      prepTime: prepTime || 0,
      cookTime: cookTime || 0,
      servings: servings || 1,
      difficulty: difficulty || 'sedang',
      images: images || [],
      youtubeUrl: youtubeUrl || null,
      author: req.user._id,
      likes: [],
      saves: []
    });
    
    await recipe.save();
    
    res.status(201).json({
      success: true,
      message: 'Recipe created successfully',
      recipe
    });
  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Update recipe
app.put('/recipes/:id', authenticateToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ 
        success: false, 
        message: 'Recipe not found' 
      });
    }
    
    // Check if user is the author
    if (recipe.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this recipe' 
      });
    }
    
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        recipe[key] = req.body[key];
      }
    });
    
    recipe.updatedAt = Date.now();
    await recipe.save();
    
    res.json({
      success: true,
      message: 'Recipe updated successfully',
      recipe
    });
  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Delete recipe
app.delete('/recipes/:id', authenticateToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ 
        success: false, 
        message: 'Recipe not found' 
      });
    }
    
    // Check if user is the author
    if (recipe.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this recipe' 
      });
    }
    
    await recipe.deleteOne();
    
    res.json({
      success: true,
      message: 'Recipe deleted successfully'
    });
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Like/Unlike recipe
app.post('/recipes/:id/like', authenticateToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ 
        success: false, 
        message: 'Recipe not found' 
      });
    }
    
    const userId = req.user._id;
    const hasLiked = recipe.likes.includes(userId);
    
    if (hasLiked) {
      // Unlike
      recipe.likes = recipe.likes.filter(id => id.toString() !== userId.toString());
    } else {
      // Like
      recipe.likes.push(userId);
    }
    
    await recipe.save();
    
    res.json({
      success: true,
      message: hasLiked ? 'Recipe unliked' : 'Recipe liked',
      likes: recipe.likes.length,
      isLiked: !hasLiked
    });
  } catch (error) {
    console.error('Like recipe error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Save/Unsave recipe
app.post('/recipes/:id/save', authenticateToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ 
        success: false, 
        message: 'Recipe not found' 
      });
    }
    
    const userId = req.user._id;
    const hasSaved = recipe.saves.includes(userId);
    
    if (hasSaved) {
      // Unsave
      recipe.saves = recipe.saves.filter(id => id.toString() !== userId.toString());
    } else {
      // Save
      recipe.saves.push(userId);
    }
    
    await recipe.save();
    
    res.json({
      success: true,
      message: hasSaved ? 'Recipe unsaved' : 'Recipe saved',
      saves: recipe.saves.length,
      isSaved: !hasSaved
    });
  } catch (error) {
    console.error('Save recipe error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get user's recipes
app.get('/users/:userId/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find({ author: req.params.userId })
      .populate('author', 'username fullName profilePicture')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      recipes
    });
  } catch (error) {
    console.error('Get user recipes error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Recipes Service running on port ${PORT}`);
});