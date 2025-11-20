const express = require('express');
const AuthController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes
router.post('/register', authLimiter, AuthController.registerValidation, AuthController.register);
router.post('/login', authLimiter, AuthController.loginValidation, AuthController.login);

// Protected routes
router.get('/me', authMiddleware, AuthController.me);
router.post('/change-password', authMiddleware, AuthController.changePasswordValidation, AuthController.changePassword);

module.exports = router;
