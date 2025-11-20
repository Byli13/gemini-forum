const UserModel = require('../models/User');
const config = require('../config');

class UserController {
  static async getProfile(req, res, next) {
    try {
      const { username } = req.params;
      
      const user = await UserModel.findByUsername(username);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ user });
    } catch (error) {
      next(error);
    }
  }
  
  static async updateProfile(req, res, next) {
    try {
      const { bio, avatar_url } = req.body;
      
      const updates = {};
      if (bio !== undefined) updates.bio = bio;
      if (avatar_url !== undefined) updates.avatar_url = avatar_url;
      
      const user = await UserModel.update(req.user.id, updates);
      
      res.json({
        message: 'Profile updated successfully',
        user,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async listUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || config.pagination.defaultLimit, config.pagination.maxLimit);
      const offset = (page - 1) * limit;
      
      const users = await UserModel.list(offset, limit);
      const total = await UserModel.count();
      
      res.json({
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async updateUserRole(req, res, next) {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      
      if (!['user', 'moderator', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      
      const user = await UserModel.update(userId, { role });
      
      res.json({
        message: 'User role updated successfully',
        user,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async toggleUserActive(req, res, next) {
    try {
      const { userId } = req.params;
      
      const user = await UserModel.findById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      await UserModel.setActive(userId, !user.is_active);
      
      res.json({
        message: 'User active status updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
