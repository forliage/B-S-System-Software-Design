const express = require('express');
const cors = require('cors');
const path = require('path'); // 引入 path 模块
require('dotenv').config();

// 引入路由
const userRoutes = require('./routes/userRoutes');
const photoRoutes = require('./routes/photoRoutes'); 
const commentRoutes = require('./routes/commentRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// --- 静态文件服务 ---
// 让 'uploads' 目录下的文件可以通过 URL 直接访问
// 例如 http://localhost:3001/1678886400000.jpg
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// --- API 路由 ---
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is running!' });
});
app.use('/api/users', userRoutes);
app.use('/api/photos', photoRoutes);

photoRoutes.use('/:photoId/comments', commentRoutes);

// --- 服务器启动 ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});