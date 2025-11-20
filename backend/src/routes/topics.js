const express = require('express');
const TopicController = require('../controllers/topicController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { createLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/:topicId', TopicController.getTopic);
router.post('/', authMiddleware, createLimiter, TopicController.createValidation, TopicController.create);
router.put('/:topicId', authMiddleware, TopicController.updateValidation, TopicController.update);
router.delete('/:topicId', authMiddleware, TopicController.delete);

// Moderation actions
router.post('/:topicId/pin', authMiddleware, requireRole('moderator', 'admin'), TopicController.togglePin);
router.post('/:topicId/lock', authMiddleware, requireRole('moderator', 'admin'), TopicController.toggleLock);

module.exports = router;
