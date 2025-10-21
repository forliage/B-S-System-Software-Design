const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 引入路由
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// --- API 路由 ---

// 用于测试连通性的路由 (可以保留或删除)
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

// 使用用户路由，所有 /api/users 开头的请求都会被转发到 userRoutes
app.use('/api/users', userRoutes);

// --- 服务器启动 ---
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});