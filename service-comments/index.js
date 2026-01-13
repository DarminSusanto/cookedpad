// index.js
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const Comment = require('./models/Comment');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cookedpad')
  .then(() => console.log('Comments Service: MongoDB Connected'))
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
    service: 'Comments Service', 
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Get comments for a recipe
app.get('/recipes/:recipeId/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ 
      recipe: req.params.recipeId,
      parentComment: null 
    })
      .populate('author', 'username fullName profilePicture')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'username fullName profilePicture'
        }
      })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      comments
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Add comment
app.post('/recipes/:recipeId/comments', authenticateToken, async (req, res) => {
  try {
    const { content, parentCommentId } = req.body;
    
    if (!content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Comment content is required' 
      });
    }
    
    const comment = new Comment({
      content,
      recipe: req.params.recipeId,
      author: req.user._id,
      parentComment: parentCommentId || null
    });
    
    await comment.save();
    
    // If this is a reply, add to parent comment's replies
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (parentComment) {
        parentComment.replies.push(comment._id);
        await parentComment.save();
      }
    }
    
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username fullName profilePicture');
    
    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: populatedComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Update comment
app.put('/comments/:id', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Comment content is required' 
      });
    }
    
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Comment not found' 
      });
    }
    
    // Check if user is the author
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this comment' 
      });
    }
    
    comment.content = content;
    comment.updatedAt = Date.now();
    await comment.save();
    
    res.json({
      success: true,
      message: 'Comment updated successfully',
      comment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Delete comment
app.delete('/comments/:id', authenticateToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Comment not found' 
      });
    }
    
    // Check if user is the author
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this comment' 
      });
    }
    
    // If this comment has replies, remove them too
    if (comment.replies.length > 0) {
      await Comment.deleteMany({ _id: { $in: comment.replies } });
    }
    
    // If this is a reply, remove from parent comment's replies
    if (comment.parentComment) {
      const parentComment = await Comment.findById(comment.parentComment);
      if (parentComment) {
        parentComment.replies = parentComment.replies.filter(
          replyId => replyId.toString() !== comment._id.toString()
        );
        await parentComment.save();
      }
    }
    
    await comment.deleteOne();
    
    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Comments Service running on port ${PORT}`);
});