import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user); // 使用 AuthContext 中的 login 函数
        navigate('/dashboard'); // 登录成功后跳转到仪表盘
      } else {
        setError(data.error || '登录失败');
      }
    } catch (err) {
      setError('无法连接到服务器');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>用户登录</h2>
        {error && <div className="message error">{error}</div>}
        <div className="form-group">
          <label htmlFor="email">邮箱</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">密码</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <button type="submit" className="login-button">登录</button>
        <p>
          没有账户? <Link to="/register" className="switch-link">立即注册</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;