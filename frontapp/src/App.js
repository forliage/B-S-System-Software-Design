import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Register from './components/Register';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Upload from './components/Upload';
import Dashboard from './components/Dashboard';
import PhotoDetail from './components/PhotoDetail'; 
import EditPhoto from './components/EditPhoto';
import Favorites from './components/Favorites'; // 导入收藏夹组件
import './App.css';

// 主页：根据登录状态决定显示内容
function HomePage() {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? <Navigate to="/dashboard" /> : (
    <div className="container mx-auto text-center mt-20">
      <h1 className="text-4xl font-bold">欢迎来到图片管理网站</h1>
      <p className="mt-4 text-lg">请 <Link to="/login" className="text-blue-500 hover:underline">登录</Link> 或 <Link to="/register" className="text-blue-500 hover:underline">注册</Link> 开始使用。</p>
    </div>
  );
}

// 受保护路由组件
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useContext(AuthContext);
  if (loading) {
    return <div className="text-center mt-20">加载中...</div>;
  }
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/upload"
            element={<ProtectedRoute><Upload /></ProtectedRoute>}
          />
          <Route
            path="/favorites"
            element={<ProtectedRoute><Favorites /></ProtectedRoute>}
          />
          <Route path="/photo/:id" element={<PhotoDetail />} />
          <Route
            path="/photo/:id/edit"
            element={<ProtectedRoute><EditPhoto /></ProtectedRoute>}
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;