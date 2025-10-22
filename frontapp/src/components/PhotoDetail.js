import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './PhotoDetail.css';

function PhotoDetail() {
  const { id } = useParams(); // 从 URL 中获取图片 ID
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useContext(AuthContext);

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/photos/${id}`);
        if (!response.ok) {
          throw new Error('图片未找到');
        }
        const data = await response.json();
        setPhoto(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPhoto();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('您确定要永久删除这张图片吗？')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/photos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '删除失败');
      }
      
      alert('图片删除成功！');
      navigate('/dashboard'); // 删除成功后返回图库
    } catch (err) {
      alert(`删除失败: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="detail-loading">正在加载图片详情...</div>;
  }

  if (error) {
    return <div className="detail-error">错误: {error}</div>;
  }

  if (!photo) {
    return <div className="detail-error">未找到图片。</div>;
  }

  // 检查当前登录用户是否是图片的所有者
  const isOwner = user && user.userId === photo.user_id;

  return (
    <div className="photo-detail-container">
      <div className="photo-image-container">
        <img src={photo.url} alt={photo.title} />
      </div>
      <div className="photo-meta-container">
        <h2>{photo.title}</h2>
        <p>{photo.description || '暂无描述'}</p>
        <div className="meta-item">
          <strong>上传时间:</strong>
          <span>{new Date(photo.upload_time).toLocaleString()}</span>
        </div>
        {isOwner && (
          <button onClick={handleDelete} className="delete-button">删除图片</button>
        )}
      </div>
    </div>
  );
}

export default PhotoDetail;