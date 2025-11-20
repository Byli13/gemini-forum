const { body } = require('express-validator');
const TopicModel = require('../models/Topic');
const PostModel = require('../models/Post');
const ForumModel = require('../models/Forum');
const validate = require('../middleware/validate');
const config = require('../config');

class TopicController {
  static async getTopic(req, res, next) {
    try {
      const { topicId } = req.params;
      
      const topic = await TopicModel.findById(topicId);
      
      if (!topic) {
        return res.status(404).json({ error: 'Topic not found' });
      }
      
      // Increment view count
      await TopicModel.incrementViewCount(topicId);
      
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
      const offset = (page - 1) * limit;
      
      const posts = await PostModel.listByTopic(topicId, offset, limit);
      const totalPosts = await PostModel.countByTopic(topicId);
      
      res.json({
        topic,
        posts,
        pagination: {
          page,
          limit,
          total: totalPosts,
          pages: Math.ceil(totalPosts / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
  
  static createValidation = [
    body('title')
      .trim()
      .isLength({ min: 5, max: 255 })
      .withMessage('Title must be between 5 and 255 characters'),
    body('content')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Content must be at least 10 characters'),
    body('forumId')
      .notEmpty()
      .withMessage('Forum ID is required')
      .isUUID()
      .withMessage('Invalid forum ID'),
    validate,
  ];
  
  static async create(req, res, next) {
    try {
      const { title, content, forumId } = req.body;
      
      // Create slug from title
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Create topic
      const topic = await TopicModel.create({
        forumId,
        userId: req.user.id,
        title,
        slug,
      });
      
      // Create first post
      await PostModel.create({
        topicId: topic.id,
        userId: req.user.id,
        content,
      });
      
      res.status(201).json({
        message: 'Topic created successfully',
        topic,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static updateValidation = [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 5, max: 255 })
      .withMessage('Title must be between 5 and 255 characters'),
    validate,
  ];
  
  static async update(req, res, next) {
    try {
      const { topicId } = req.params;
      const { title } = req.body;
      
      const topic = await TopicModel.findById(topicId);
      
      if (!topic) {
        return res.status(404).json({ error: 'Topic not found' });
      }
      
      // Check permissions
      if (topic.user_id !== req.user.id && !['admin', 'moderator'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      const updates = {};
      if (title) {
        updates.title = title;
        updates.slug = title.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      }
      
      const updatedTopic = await TopicModel.update(topicId, updates);
      
      res.json({
        message: 'Topic updated successfully',
        topic: updatedTopic,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async delete(req, res, next) {
    try {
      const { topicId } = req.params;
      
      const topic = await TopicModel.findById(topicId);
      
      if (!topic) {
        return res.status(404).json({ error: 'Topic not found' });
      }
      
      // Check permissions
      if (topic.user_id !== req.user.id && !['admin', 'moderator'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      await TopicModel.delete(topicId);
      
      res.json({ message: 'Topic deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
  
  static async togglePin(req, res, next) {
    try {
      const { topicId } = req.params;
      
      const topic = await TopicModel.findById(topicId);
      
      if (!topic) {
        return res.status(404).json({ error: 'Topic not found' });
      }
      
      const updatedTopic = await TopicModel.update(topicId, {
        is_pinned: !topic.is_pinned,
      });
      
      res.json({
        message: 'Topic pin status updated',
        topic: updatedTopic,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async toggleLock(req, res, next) {
    try {
      const { topicId } = req.params;
      
      const topic = await TopicModel.findById(topicId);
      
      if (!topic) {
        return res.status(404).json({ error: 'Topic not found' });
      }
      
      const updatedTopic = await TopicModel.update(topicId, {
        is_locked: !topic.is_locked,
      });
      
      res.json({
        message: 'Topic lock status updated',
        topic: updatedTopic,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TopicController;
