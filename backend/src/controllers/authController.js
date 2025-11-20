const { body } = require('express-validator');
const AuthService = require('../services/authService');
const validate = require('../middleware/validate');

class AuthController {
  static registerValidation = [
    body('username')
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
    body('email')
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    validate,
  ];
  
  static async register(req, res, next) {
    try {
      const { username, email, password } = req.body;
      
      const result = await AuthService.register(username, email, password);
      
      res.status(201).json({
        message: 'Registration successful',
        user: {
          id: result.user.id,
          username: result.user.username,
          email: result.user.email,
          role: result.user.role,
        },
        token: result.token,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static loginValidation = [
    body('usernameOrEmail').notEmpty().withMessage('Username or email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ];
  
  static async login(req, res, next) {
    try {
      const { usernameOrEmail, password } = req.body;
      
      const result = await AuthService.login(usernameOrEmail, password);
      
      res.json({
        message: 'Login successful',
        user: {
          id: result.user.id,
          username: result.user.username,
          email: result.user.email,
          role: result.user.role,
          avatar_url: result.user.avatar_url,
        },
        token: result.token,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async me(req, res, next) {
    try {
      const UserModel = require('../models/User');
      const user = await UserModel.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ user });
    } catch (error) {
      next(error);
    }
  }
  
  static changePasswordValidation = [
    body('oldPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
    validate,
  ];
  
  static async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;
      
      await AuthService.changePassword(req.user.id, oldPassword, newPassword);
      
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
