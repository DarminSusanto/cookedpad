// models/Recipe.js
const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  ingredients: [{
    name: String,
    quantity: String,
    unit: String
  }],
  instructions: [{
    step: Number,
    description: String,
    image: String // Base64 untuk step images
  }],
  category: {
    type: String,
    enum: ['makanan', 'minuman', 'kue', 'sarapan', 'makan_malam', 'cemilan'],
    default: 'makanan'
  },
  prepTime: { // dalam menit
    type: Number,
    required: true
  },
  cookTime: { // dalam menit
    type: Number,
    required: true
  },
  servings: {
    type: Number,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['mudah', 'sedang', 'sulit'],
    default: 'sedang'
  },
  images: [String], // Array of Base64 strings
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  saves: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Recipe', recipeSchema);