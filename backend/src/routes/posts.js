const express = require('express');
const PostController = require('../controllers/postController');
const { authMiddleware } = require('../middleware/auth');
const { createLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/', authMiddleware, createLimiter, PostController.createValidation, PostController.create);
router.put('/:postId', authMiddleware, PostController.updateValidation, PostController.update);
router.delete('/:postId', authMiddleware, PostController.delete);

// Reactions
router.post('/:postId/reactions', authMiddleware, PostController.addReaction);
router.delete('/:postId/reactions', authMiddleware, PostController.removeReaction);

module.exports = router;
