import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-gray-800 hover:text-blue-500 transition-colors duration-300">
          图像站
        </Link>
        <div className="flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              <span className="text-gray-700 hidden sm:block">你好, {user?.username}!</span>
              <Link to="/dashboard" className="text-gray-600 hover:text-blue-500 transition-colors duration-300">
                我的图库
              </Link>
              <Link to="/favorites" className="text-gray-600 hover:text-blue-500 transition-colors duration-300">
                我的收藏
              </Link>
              <Link to="/upload" className="text-gray-600 hover:text-blue-500 transition-colors duration-300">
                上传
              </Link>
              <button onClick={handleLogout} className="text-gray-600 hover:text-red-500 transition-colors duration-300">
                退出
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-blue-500 transition-colors duration-300">
                登录
              </Link>
              <Link to="/register" className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors duration-300">
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;