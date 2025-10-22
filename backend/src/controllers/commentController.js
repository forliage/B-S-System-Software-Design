const db = require('../db');

// 获取某张图片的所有评论
exports.getCommentsForPhoto = async (req, res) => {
  const { photoId } = req.params;
  try {
    // 使用 JOIN 查询来同时获取评论者信息
    const [comments] = await db.query(
      `SELECT c.comment_id, c.content, c.comment_time, u.username 
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

// 为图片添加新评论
exports.addCommentToPhoto = async (req, res) => {
  const { photoId } = req.params;
  const { userId } = req.user;
  const { content } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({ error: '评论内容不能为空' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO Comment (photo_id, user_id, content) VALUES (?, ?, ?)',
      [photoId, userId, content]
    );

    // 返回新创建的评论，包含用户信息
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