const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator'); // 新增

const saltRounds = 10;

// 用户注册处理函数
exports.register = async (req, res) => {
  // 新增：处理验证结果
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    const [existingUsers] = await db.query(
      'SELECT * FROM User WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: '用户名或邮箱已被注册' });
    }

    const passwordHash = await bcrypt.hash(password, saltRounds);

    const [result] = await db.query(
      'INSERT INTO User (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );

    res.status(201).json({
      message: '用户注册成功',
      userId: result.insertId,
      username: username,
    });
  } catch (error) {
    console.error('注册过程中发生错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};

// 用户登录处理函数
exports.login = async (req, res) => {
  // 新增：处理验证结果
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }
    
  const { email, password } = req.body;

  try {
    const [users] = await db.query('SELECT * FROM User WHERE email = ?', [email]);
    const user = users[0];

    if (!user) {
      return res.status(401).json({ error: '无效的邮箱或密码' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: '无效的邮箱或密码' });
    }

    const payload = { userId: user.user_id, username: user.username };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      message: '登录成功',
      token: token,
      user: { userId: user.user_id, username: user.username },
    });
  } catch (error) {
    console.error('登录过程中发生错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};