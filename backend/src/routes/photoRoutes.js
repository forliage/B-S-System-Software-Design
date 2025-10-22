const express = require('express');
const multer = require('multer');
const path = require('path');
const photoController = require('../controllers/photoController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ... (Multer 配置和上传路由保持不变)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/upload', protect, upload.single('image'), photoController.uploadPhoto);

// 获取当前用户的所有图片 (新增)
// GET /api/photos/my-photos
router.get('/my-photos', protect, photoController.searchPhotos);

router.get('/:id', photoController.getPhotoById);
router.delete('/:id', protect, photoController.deletePhoto);

// PUT /api/photos/:id
router.put('/:id', protect, photoController.updatePhotoInfo);

// 点赞/取消点赞图片 (新增)
// POST /api/photos/:id/like
router.post('/:id/like', protect, photoController.toggleLike);

module.exports = router;