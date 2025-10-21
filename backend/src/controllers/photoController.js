const db = require('../db');

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