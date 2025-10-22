const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams 允许访问父路由的参数 (如 :photoId)
const commentController = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/photos/:photoId/comments
router.get('/', commentController.getCommentsForPhoto);

// POST /api/photos/:photoId/comments
router.post('/', protect, commentController.addCommentToPhoto);

module.exports = router;