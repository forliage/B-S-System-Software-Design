const db = require('../db');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken'); 

// 上传图片的函数
exports.uploadPhoto = async (req, res) => {
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
  const { id } = req.params;

  try {
    const [photos] = await db.query('SELECT * FROM Photo WHERE photo_id = ?', [id]);
    const photo = photos[0];

    if (!photo) {
      return res.status(404).json({ error: '图片未找到' });
    }

    photo.url = `http://localhost:3001/${photo.filepath.replace(/\\/g, '/')}`;

    // 新增：获取该用户的所有图片
    const [userPhotos] = await db.query(
      'SELECT * FROM Photo WHERE user_id = ? ORDER BY upload_time DESC',
      [photo.user_id]
    );

    // 为所有图片添加完整 URL
    const userPhotosWithUrls = userPhotos.map(p => ({
        ...p,
        url: `http://localhost:3001/${p.filepath.replace(/\\/g, '/')}`
    }));

    let isLiked = false;
    // 检查请求头中是否有 token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const [likes] = await db.query(
          'SELECT * FROM `Like` WHERE user_id = ? AND photo_id = ?',
          [userId, id]
        );
        if (likes.length > 0) {
          isLiked = true;
        }
      } catch (error) {
        // Token 无效或过期，不影响匿名用户查看，isLiked 保持 false
      }
    }

    // 返回包含图片信息和当前用户点赞状态的对象
    res.status(200).json({ photo, userPhotos: userPhotosWithUrls, isLiked });
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

// 更新图片信息 (新增)
exports.updatePhotoInfo = async (req, res) => {
  const { id } = req.params; // 图片ID
  const { title, description } = req.body; // 新的标题和描述
  const { userId } = req.user; // 当前登录用户ID

  // 基础验证
  if (!title) {
    return res.status(400).json({ error: '标题不能为空' });
  }

  try {
    // 1. 验证图片是否存在且属于当前用户
    const [photos] = await db.query('SELECT * FROM Photo WHERE photo_id = ?', [id]);
    const photo = photos[0];

    if (!photo) {
      return res.status(404).json({ error: '图片未找到' });
    }

    if (photo.user_id !== userId) {
      return res.status(403).json({ error: '无权修改此图片' });
    }

    // 2. 更新数据库
    await db.query(
      'UPDATE Photo SET title = ?, description = ? WHERE photo_id = ?',
      [title, description || null, id] // 如果 description 为空字符串，存为 null
    );
    
    // 3. 查询更新后的数据并返回
    const [updatedPhotos] = await db.query('SELECT * FROM Photo WHERE photo_id = ?', [id]);
    const updatedPhoto = updatedPhotos[0];
    updatedPhoto.url = `http://localhost:3001/${updatedPhoto.filepath.replace(/\\/g, '/')}`;

    res.status(200).json({
      message: '图片信息更新成功',
      photo: updatedPhoto,
    });

  } catch (error) {
    console.error('更新图片信息失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};

// 点赞/取消点赞图片 (新增)
exports.toggleLike = async (req, res) => {
  const { id } = req.params; // 图片 ID
  const { userId } = req.user; // 当前登录用户 ID

  const connection = await db.getConnection(); // 使用事务来保证数据一致性

  try {
    await connection.beginTransaction();

    // 1. 检查用户是否已经点赞
    const [likes] = await connection.query(
      'SELECT * FROM `Like` WHERE user_id = ? AND photo_id = ?',
      [userId, id]
    );

    let liked = false;
    if (likes.length > 0) {
      // 如果已点赞，则取消点赞
      await connection.query(
        'DELETE FROM `Like` WHERE user_id = ? AND photo_id = ?',
        [userId, id]
      );
      await connection.query(
        'UPDATE Photo SET like_count = like_count - 1 WHERE photo_id = ? AND like_count > 0',
        [id]
      );
      liked = false;
    } else {
      // 如果未点赞，则添加点赞
      await connection.query(
        'INSERT INTO `Like` (user_id, photo_id) VALUES (?, ?)',
        [userId, id]
      );
      await connection.query(
        'UPDATE Photo SET like_count = like_count + 1 WHERE photo_id = ?',
        [id]
      );
      liked = true;
    }

    // 查询最新的点赞数
    const [photos] = await connection.query(
      'SELECT like_count FROM Photo WHERE photo_id = ?',
      [id]
    );

    await connection.commit(); // 提交事务

    res.status(200).json({
      message: liked ? '点赞成功' : '取消点赞成功',
      liked: liked,
      likeCount: photos[0].like_count,
    });

  } catch (error) {
    await connection.rollback(); // 如果出错，回滚事务
    console.error('点赞操作失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  } finally {
    connection.release(); // 释放连接
  }
};