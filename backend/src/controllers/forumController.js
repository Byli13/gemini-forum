const ForumModel = require('../models/Forum');
const TopicModel = require('../models/Topic');
const config = require('../config');

class ForumController {
  static async listAll(req, res, next) {
    try {
      const categories = await ForumModel.findAll();
      res.json({ categories });
    } catch (error) {
      next(error);
    }
  }
  
  static async getForum(req, res, next) {
    try {
      const { categorySlug, forumSlug } = req.params;
      
      const forum = await ForumModel.findBySlug(categorySlug, forumSlug);
      
      if (!forum) {
        return res.status(404).json({ error: 'Forum not found' });
      }
      
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
      const offset = (page - 1) * limit;
      
      const topics = await TopicModel.listByForum(forum.id, offset, limit);
      const totalTopics = await TopicModel.countByForum(forum.id);
      
      res.json({
        forum,
        topics,
        pagination: {
          page,
          limit,
          total: totalTopics,
          pages: Math.ceil(totalTopics / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ForumController;
