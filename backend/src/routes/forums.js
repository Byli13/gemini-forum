const express = require('express');
const ForumController = require('../controllers/forumController');

const router = express.Router();

router.get('/', ForumController.listAll);
router.get('/:categorySlug/:forumSlug', ForumController.getForum);

module.exports = router;
