const express = require('express');
const authRoutes = require('./auth');
const forumRoutes = require('./forums');
const topicRoutes = require('./topics');
const postRoutes = require('./posts');
const userRoutes = require('./users');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/forums', forumRoutes);
router.use('/topics', topicRoutes);
router.use('/posts', postRoutes);
router.use('/users', userRoutes);

module.exports = router;
