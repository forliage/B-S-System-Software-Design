const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const photoController = require('../controllers/photoController');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images Only!');
        }
    }
});

router.post('/', protect, upload.single('image'), photoController.uploadPhoto);
router.get('/', photoController.getPhotos);
router.get('/:id', photoController.getPhotoById);
router.delete('/:id', protect, photoController.deletePhoto);
router.post('/:id/edit', protect, photoController.editPhoto);
router.post('/:id/like', protect, photoController.likePhoto);
router.post('/:id/comments', protect, photoController.addComment);

module.exports = router;
