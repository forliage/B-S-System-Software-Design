// backend/src/routes/photoRoutes.js (完整代码)

const express = require('express');
const multer = require('multer');
const path = require('path');
const { body } = require('express-validator'); // 新增
const photoController = require('../controllers/photoController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// 新增：MIME类型白名单
const MimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

// 修改：Multer 配置，增加文件过滤器
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (MimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型！仅允许上传图片。'), false);
    }
  }
});

// 新增：上传和更新的验证和清理规则
const photoValidationRules = [
    body('title').trim().notEmpty().withMessage('标题不能为空').escape(),
    body('description').trim().escape(),
    body('tags').trim().escape(),
];

// POST /api/photos/upload - 添加验证中间件
router.post(
  '/upload',
  protect,
  upload.single('image'),
  photoValidationRules,
  photoController.uploadPhoto
);

// PUT /api/photos/:id - 添加验证中间件
router.put('/:id', protect, photoValidationRules, photoController.updatePhotoInfo);


// --- 其他路由保持不变 ---
router.get('/my-photos', protect, photoController.searchPhotos);
router.get('/:id', photoController.getPhotoById);
router.delete('/:id', protect, photoController.deletePhoto);
router.post('/:id/like', protect, photoController.toggleLike);

module.exports = router;