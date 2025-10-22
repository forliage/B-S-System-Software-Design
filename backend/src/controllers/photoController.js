const db = require('../db');
const fs = require('fs');
const path = require('path');

// 上传图片的函数 (保持不变)
exports.uploadPhoto = async (req, res) => {
  // ... (代码不变)
  const { title, description } = req.body;
  const { filename, path: filepath } = req.file;
  const { userId } = req.user;

  if (!title || !req.file) {
    return res.status(400).json({ error: '标题和图片文件不能为空' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO Photo (user_id, title, description, filename, filepath) VALUES (?, ?, ?, ?, ?)',
      [userId, title, description, filename, filepath]
    );

    const insertedId = result.insertId;
    const [rows] = await db.query('SELECT * FROM Photo WHERE photo_id = ?', [insertedId]);

    res.status(201).json({
      message: '图片上传成功',
      photo: rows[0],
    });
  } catch (error) {
    console.error('图片上传失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};

// 获取当前登录用户所有图片的函数 (新增)
exports.getUserPhotos = async (req, res) => {
  const { userId } = req.user; // 从认证中间件获取用户ID

  try {
    // 查询数据库，按上传时间降序排列
    const [photos] = await db.query(
      'SELECT * FROM Photo WHERE user_id = ? ORDER BY upload_time DESC',
      [userId]
    );

    // 为每个图片的 filepath 添加服务器前缀，方便前端直接使用
    const photosWithFullUrl = photos.map(photo => ({
      ...photo,
      url: `http://localhost:3001/${photo.filepath.replace(/\\/g, '/')}`
    }));

    res.status(200).json(photosWithFullUrl);
  } catch (error) {
    console.error('获取用户图片失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};

// 获取单张图片详情 (新增)
exports.getPhotoById = async (req, res) => {
  const { id } = req.params; // 从 URL 中获取图片 ID

  try {
    const [photos] = await db.query('SELECT * FROM Photo WHERE photo_id = ?', [id]);
    const photo = photos[0];

    if (!photo) {
      return res.status(404).json({ error: '图片未找到' });
    }

    // 为图片添加完整的 URL
    photo.url = `http://localhost:3001/${photo.filepath.replace(/\\/g, '/')}`;
    
    res.status(200).json(photo);
  } catch (error) {
    console.error('获取图片详情失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};

// 删除图片 (新增)
exports.deletePhoto = async (req, res) => {
  const { id } = req.params; // 从 URL 中获取图片 ID
  const { userId } = req.user; // 从认证中间件获取当前登录用户的 ID

  try {
    // 1. 查找图片信息，确保图片存在且属于当前用户
    const [photos] = await db.query('SELECT * FROM Photo WHERE photo_id = ?', [id]);
    const photo = photos[0];

    if (!photo) {
      return res.status(404).json({ error: '图片未找到' });
    }

    // 权限验证：确保操作者是图片的所有者
    if (photo.user_id !== userId) {
      return res.status(403).json({ error: '无权删除此图片' });
    }

    // 2. 从文件系统中删除图片文件
    const filePath = path.join(__dirname, '..', '..', photo.filepath);
    fs.unlink(filePath, (err) => {
      if (err) {
        // 即使文件删除失败，我们仍然继续删除数据库记录
        // 但在生产环境中应该记录这个错误
        console.error('删除文件失败:', err);
      }
    });

    // 3. 从数据库中删除记录
    await db.query('DELETE FROM Photo WHERE photo_id = ?', [id]);

    res.status(200).json({ message: '图片删除成功' });
  } catch (error) {
    console.error('删除图片失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};