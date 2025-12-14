const express = require('express');
const router = express.Router({ mergeParams: true });
const { body } = require('express-validator'); // 新增
const commentController = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

// 新增：评论验证和清理规则
const commentValidationRules = [
    body('content').trim().notEmpty().withMessage('评论内容不能为空').escape()
];

// GET /api/photos/:photoId/comments
router.get('/', commentController.getCommentsForPhoto);

// POST /api/photos/:photoId/comments - 添加验证中间件
router.post('/', protect, commentValidationRules, commentController.addCommentToPhoto);

// DELETE /api/photos/:photoId/comments/:commentId - 删除评论
router.delete('/:commentId', protect, commentController.deleteComment);

module.exports = router;