const { body } = require('express-validator');
const PostModel = require('../models/Post');
const TopicModel = require('../models/Topic');
const validate = require('../middleware/validate');

class PostController {
  static createValidation = [
    body('content')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Content must be at least 10 characters'),
    body('topicId')
      .notEmpty()
      .withMessage('Topic ID is required')
      .isUUID()
      .withMessage('Invalid topic ID'),
    validate,
  ];
  
  static async create(req, res, next) {
    try {
      const { content, topicId } = req.body;
      
      // Check if topic exists and is not locked
      const topic = await TopicModel.findById(topicId);
      
      if (!topic) {
        return res.status(404).json({ error: 'Topic not found' });
      }
      
      if (topic.is_locked && !['admin', 'moderator'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Topic is locked' });
      }
      
      const post = await PostModel.create({
        topicId,
        userId: req.user.id,
        content,
      });
      
      res.status(201).json({
        message: 'Post created successfully',
        post,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static updateValidation = [
    body('content')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Content must be at least 10 characters'),
    validate,
  ];
  
  static async update(req, res, next) {
    try {
      const { postId } = req.params;
      const { content } = req.body;
      
      const post = await PostModel.findById(postId);
      
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      // Check permissions
      if (post.user_id !== req.user.id && !['admin', 'moderator'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      const updatedPost = await PostModel.update(postId, content);
      
      res.json({
        message: 'Post updated successfully',
        post: updatedPost,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async delete(req, res, next) {
    try {
      const { postId } = req.params;
      
      const post = await PostModel.findById(postId);
      
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      // Check permissions
      if (post.user_id !== req.user.id && !['admin', 'moderator'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      await PostModel.delete(postId);
      
      res.json({ message: 'Post deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
  
  static async addReaction(req, res, next) {
    try {
      const { postId } = req.params;
      const { reactionType = 'like' } = req.body;
      
      const post = await PostModel.findById(postId);
      
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      await PostModel.addReaction(postId, req.user.id, reactionType);
      
      res.json({ message: 'Reaction added successfully' });
    } catch (error) {
      next(error);
    }
  }
  
  static async removeReaction(req, res, next) {
    try {
      const { postId } = req.params;
      const { reactionType = 'like' } = req.body;
      
      await PostModel.removeReaction(postId, req.user.id, reactionType);
      
      res.json({ message: 'Reaction removed successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PostController;
