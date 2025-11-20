const express = require('express');
const UserController = require('../controllers/userController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/:username', UserController.getProfile);

// Protected routes
router.put('/profile', authMiddleware, UserController.updateProfile);

// Admin routes
router.get('/', authMiddleware, requireRole('admin'), UserController.listUsers);
router.put('/:userId/role', authMiddleware, requireRole('admin'), UserController.updateUserRole);
router.post('/:userId/toggle-active', authMiddleware, requireRole('admin'), UserController.toggleUserActive);

module.exports = router;
