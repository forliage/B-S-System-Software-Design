import React, { useState } from 'react';
import './Register.css'; // 引入样式

function Register() {
  // 使用 state 管理表单数据
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  // 使用 state 管理来自服务器的反馈消息
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // 处理输入框变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault(); // 阻止表单默认提交行为
    setMessage('');     // 重置消息
    setIsError(false);

    // 客户端基本验证
    if (formData.password.length < 6) {
      setMessage('密码长度不能少于6位');
      setIsError(true);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // 注册成功
        setMessage(data.message);
        setIsError(false);
        // 成功后可以清空表单
        setFormData({ username: '', email: '', password: '' });
      } else {
        // 注册失败
        setMessage(data.error || '注册失败，请稍后再试');
        setIsError(true);
      }
    } catch (error) {
      // 网络或其他错误
      setMessage('无法连接到服务器');
      setIsError(true);
      console.error('注册请求错误:', error);
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>创建您的账户</h2>

        {message && (
          <div className={`message ${isError ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="username">用户名</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">邮箱</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">密码</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="register-button">
          注册
        </button>
      </form>
    </div>
  );
}

export default Register;