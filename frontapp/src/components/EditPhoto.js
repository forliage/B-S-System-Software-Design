import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './EditPhoto.css';

function EditPhoto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // 1. 获取当前图片信息以填充表单
  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/photos/${id}`);
        if (!response.ok) throw new Error('无法加载图片信息');
        const data = await response.json();
        setTitle(data.title);
        setDescription(data.description || '');
        setPhotoUrl(data.url);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPhoto();
  }, [id]);

  // 2. 提交更新
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await fetch(`http://localhost:3001/api/photos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '更新失败');
      }
      
      setMessage('更新成功！正在跳转...');
      setTimeout(() => navigate(`/photo/${id}`), 1500); // 1.5秒后跳转回详情页

    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>正在加载...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div className="edit-photo-container">
      <form className="edit-photo-form" onSubmit={handleSubmit}>
        <h2>编辑图片信息</h2>
        {message && <div className="message success">{message}</div>}
        {error && <div className="message error">{error}</div>}

        <div className="current-photo-preview">
          <img src={photoUrl} alt="Current" />
        </div>
        
        <div className="form-group">
          <label htmlFor="title">标题</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">描述</label>
          <textarea
            id="description"
            rows="5"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        <div className="edit-buttons">
          <button type="submit" className="save-button">保存更改</button>
          <button type="button" className="cancel-button" onClick={() => navigate(`/photo/${id}`)}>
            取消
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditPhoto;