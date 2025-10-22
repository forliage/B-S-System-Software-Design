const db = require('../db');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken'); // 确保引入 jwt
const { findOrCreateTags } = require('./tagController');

// 上传新图片
exports.uploadPhoto = async (req, res) => {
  const { title, description, tags } = req.body;
  const { filename, path: filepath } = req.file;
  const { userId } = req.user;

  if (!title || !req.file) {
    return res.status(400).json({ error: '标题和图片文件不能为空' });
  }

  const tagNames = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. 插入 Photo 表
    const [result] = await connection.query(
      'INSERT INTO Photo (user_id, title, description, filename, filepath) VALUES (?, ?, ?, ?, ?)',
      [userId, title, description, filename, filepath]
    );
    const photoId = result.insertId;

    // 2. 处理标签
    if (tagNames.length > 0) {
      const tagIds = await findOrCreateTags(tagNames);
      const photoTagValues = tagIds.map(tagId => [photoId, tagId]);
      await connection.query('INSERT INTO PhotoTag (photo_id, tag_id) VALUES ?', [photoTagValues]);
    }

    await connection.commit();

    // 3. 查询并返回新创建的 photo 对象
    const [rows] = await connection.query('SELECT * FROM Photo WHERE photo_id = ?', [photoId]);
    res.status(201).json({
      message: '图片上传成功',
      photo: rows[0],
    });

  } catch (error) {
    await connection.rollback();
    console.error('图片上传失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  } finally {
    connection.release();
  }
};

// 获取单张图片详情
exports.getPhotoById = async (req, res) => {
  const { id } = req.params;

  try {
    const [photos] = await db.query('SELECT * FROM Photo WHERE photo_id = ?', [id]);
    const photo = photos[0];

    if (!photo) {
      return res.status(404).json({ error: '图片未找到' });
    }

    photo.url = `http://localhost:3001/${photo.filepath.replace(/\\/g, '/')}`;

    // 获取该用户的所有图片列表（用于轮播）
    const [userPhotos] = await db.query(
      'SELECT * FROM Photo WHERE user_id = ? ORDER BY upload_time DESC',
      [photo.user_id]
    );
    const userPhotosWithUrls = userPhotos.map(p => ({
      ...p,
      url: `http://localhost:3001/${p.filepath.replace(/\\/g, '/')}`
    }));
    
    // 获取图片的标签
    const [tags] = await db.query(
      `SELECT t.name FROM Tag t JOIN PhotoTag pt ON t.tag_id = pt.tag_id WHERE pt.photo_id = ?`,
      [id]
    );
    photo.tags = tags.map(t => t.name);

    // 检查当前用户的点赞状态
    let isLiked = false;
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
        // Token 无效或过期，isLiked 保持 false
      }
    }

    res.status(200).json({ photo, userPhotos: userPhotosWithUrls, isLiked });
  } catch (error) {
    console.error('获取图片详情失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};

// 删除图片
exports.deletePhoto = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    const [photos] = await db.query('SELECT * FROM Photo WHERE photo_id = ?', [id]);
    const photo = photos[0];

    if (!photo) {
      return res.status(404).json({ error: '图片未找到' });
    }
    if (photo.user_id !== userId) {
      return res.status(403).json({ error: '无权删除此图片' });
    }

    const filePath = path.join(__dirname, '..', '..', photo.filepath);
    fs.unlink(filePath, (err) => {
      if (err) console.error('删除文件失败:', err);
    });

    await db.query('DELETE FROM Photo WHERE photo_id = ?', [id]);
    res.status(200).json({ message: '图片删除成功' });
  } catch (error) {
    console.error('删除图片失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};

// 更新图片信息
exports.updatePhotoInfo = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const { userId } = req.user;

  if (!title) {
    return res.status(400).json({ error: '标题不能为空' });
  }

  try {
    const [photos] = await db.query('SELECT * FROM Photo WHERE photo_id = ?', [id]);
    const photo = photos[0];
    if (!photo) return res.status(404).json({ error: '图片未找到' });
    if (photo.user_id !== userId) return res.status(403).json({ error: '无权修改此图片' });

    await db.query(
      'UPDATE Photo SET title = ?, description = ? WHERE photo_id = ?',
      [title, description || null, id]
    );

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

// 点赞/取消点赞图片
exports.toggleLike = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [likes] = await connection.query('SELECT * FROM `Like` WHERE user_id = ? AND photo_id = ?', [userId, id]);
    let liked = false;
    if (likes.length > 0) {
      await connection.query('DELETE FROM `Like` WHERE user_id = ? AND photo_id = ?', [userId, id]);
      await connection.query('UPDATE Photo SET like_count = like_count - 1 WHERE photo_id = ? AND like_count > 0', [id]);
      liked = false;
    } else {
      await connection.query('INSERT INTO `Like` (user_id, photo_id) VALUES (?, ?)', [userId, id]);
      await connection.query('UPDATE Photo SET like_count = like_count + 1 WHERE photo_id = ?', [id]);
      liked = true;
    }
    const [photos] = await connection.query('SELECT like_count FROM Photo WHERE photo_id = ?', [id]);
    await connection.commit();
    res.status(200).json({
      message: liked ? '点赞成功' : '取消点赞成功',
      liked,
      likeCount: photos[0].like_count,
    });
  } catch (error) {
    await connection.rollback();
    console.error('点赞操作失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  } finally {
    connection.release();
  }
};

// 搜索或获取当前用户的所有图片
exports.searchPhotos = async (req, res) => {
    const { tag } = req.query;
    const { userId } = req.user;

    try {
        let photos;
        if (tag) {
            // 按标签搜索
            [photos] = await db.query(
                `SELECT DISTINCT p.* FROM Photo p
                 JOIN PhotoTag pt ON p.photo_id = pt.photo_id
                 JOIN Tag t ON pt.tag_id = t.tag_id
                 WHERE t.name = ? AND p.user_id = ? 
                 ORDER BY p.upload_time DESC`,
                [tag, userId]
            );
        } else {
            // 获取所有图片
            [photos] = await db.query(
                'SELECT * FROM Photo WHERE user_id = ? ORDER BY upload_time DESC',
                [userId]
            );
        }

        // 为每张图片附加标签
        for (let photo of photos) {
            const [tags] = await db.query(
                `SELECT t.name FROM Tag t JOIN PhotoTag pt ON t.tag_id = pt.tag_id WHERE pt.photo_id = ?`,
                [photo.photo_id]
            );
            photo.tags = tags.map(t => t.name);
        }

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