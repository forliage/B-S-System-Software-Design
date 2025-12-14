const db = require('../db');
const { validationResult } = require('express-validator'); // 引入验证结果处理器

// 获取某张图片的所有评论
exports.getCommentsForPhoto = async (req, res) => {
  const { photoId } = req.params;
  try {
    const [comments] = await db.query(
      `SELECT c.comment_id, c.content, c.comment_time, u.username, c.user_id
       FROM Comment c 
       JOIN User u ON c.user_id = u.user_id 
       WHERE c.photo_id = ? 
       ORDER BY c.comment_time ASC`,
      [photoId]
    );
    res.status(200).json(comments);
  } catch (error) {
    console.error('获取评论失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};

// 删除评论
exports.deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const { userId } = req.user;

  try {
    // 检查评论是否存在以及用户是否有权限删除
    const [comments] = await db.query('SELECT * FROM Comment WHERE comment_id = ?', [commentId]);
    const comment = comments[0];

    if (!comment) {
      return res.status(404).json({ error: '评论未找到' });
    }

    if (comment.user_id !== userId) {
      // 在实际应用中，您可能还希望允许图片所有者或管理员删除评论
      return res.status(403).json({ error: '无权删除此评论' });
    }

    // 删除评论
    await db.query('DELETE FROM Comment WHERE comment_id = ?', [commentId]);

    res.status(200).json({ message: '评论删除成功' });
  } catch (error) {
    console.error('删除评论失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};

// 为图片添加新评论
exports.addCommentToPhoto = async (req, res) => {
  // 处理验证结果
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { photoId } = req.params;
  const { userId } = req.user;
  const { content } = req.body;

  try {
    const [result] = await db.query(
      'INSERT INTO Comment (photo_id, user_id, content) VALUES (?, ?, ?)',
      [photoId, userId, content]
    );

    const [newComment] = await db.query(
      `SELECT c.comment_id, c.content, c.comment_time, u.username 
       FROM Comment c 
       JOIN User u ON c.user_id = u.user_id 
       WHERE c.comment_id = ?`,
      [result.insertId]
    );
    
    res.status(201).json(newComment[0]);
  } catch (error) {
    console.error('添加评论失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};