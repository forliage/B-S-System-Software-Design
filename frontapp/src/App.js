import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Register from './components/Register';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Upload from './components/Upload';
import Dashboard from './components/Dashboard'; // 导入新的 Dashboard 组件
import './App.css';

// 简单的主页
function HomePage() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>欢迎来到图片管理网站</h1>
        <p>请 <Link to="/login">登录</Link> 或 <Link to="/register">注册</Link> 开始使用。</p>
      </header>
    </div>
  );
}

// 旧的 Dashboard 组件定义已被移除

// 受保护路由组件 (保持不变)
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useContext(AuthContext);
  if (loading) {
    return <div>加载中...</div>;
  }
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;