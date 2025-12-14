// routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/ai/generate-tags - AI图片标签生成
// 未来可以增加 multer 中间件来处理图片上传
router.post('/generate-tags', protect, aiController.generateTags);

// POST /api/ai/chat-search - AI聊天搜索
router.post('/chat-search', protect, aiController.chatSearch);

module.exports = router;