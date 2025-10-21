import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // 登出后返回主页
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">图片站</Link>
      <div className="navbar-links">
        {isAuthenticated ? (
          <>
            <span className="user-greeting">你好, {user.username}!</span>
            <Link to="/dashboard">我的图库</Link>
            <button onClick={handleLogout}>退出登录</button>
          </>
        ) : (
          <>
            <Link to="/login">登录</Link>
            <Link to="/register">注册</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;