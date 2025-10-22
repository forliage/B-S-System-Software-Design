const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet'); // 新增：引入 helmet
require('dotenv').config();

// 引入路由
const userRoutes = require('./routes/userRoutes');
const photoRoutes = require('./routes/photoRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();

// --- 中间件配置 ---

app.use(helmet()); // 新增：使用 helmet 设置安全HTTP头
app.use(cors());
app.use(express.json());

// --- 静态文件服务 ---
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// --- API 路由 ---
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is running!' });
});
app.use('/api/users', userRoutes);
app.use('/api/photos', photoRoutes);

// 将评论路由挂载为图片路由的子路由
photoRoutes.use('/:photoId/comments', commentRoutes);

// --- 服务器启动 ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});