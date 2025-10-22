import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import CommentSection from './CommentSection'; 
import './PhotoDetail.css';

function PhotoDetail() {
  const { id } = useParams(); // 从 URL 中获取图片 ID
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false); // 新增：追踪点赞状态
  const [likeCount, setLikeCount] = useState(0); // 新增：追踪点赞数
  const { user, token, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        // 为了获取当前用户的点赞状态，我们需要在请求中携带token
        // 所以后端 getPhotoById 接口也需要调整
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`http://localhost:3001/api/photos/${id}`, { headers });
        
        if (!response.ok) throw new Error('图片未找到');
        
        const data = await response.json();
        setPhoto(data.photo);
        setIsLiked(data.isLiked); // 从后端获取点赞状态
        setLikeCount(data.photo.like_count);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPhoto();
  }, [id, token]);
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

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('请先登录再点赞！');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/photos/${id}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setIsLiked(data.liked);
        setLikeCount(data.likeCount);
      }
    } catch (err) {
      console.error('点赞失败', err);
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
    <>
    <div className="photo-detail-container">
      <div className="photo-image-container">
        <img src={photo.url} alt={photo.title} />
      </div>
      <div className="photo-meta-container">
        <h2>{photo.title}</h2>
        <p>{photo.description || '暂无描述'}</p>
        
        <div className="like-section">
          <button onClick={handleLike} className={`like-button ${isLiked ? 'liked' : ''}`}>
            <span className="heart-icon">{isLiked ? '♥' : '♡'}</span>
            {isLiked ? '已赞' : '点赞'}
          </button>
          <span className="like-count">{likeCount} 人赞过</span>
        </div>
        
        <div className="meta-item">
          <strong>上传时间:</strong>
          <span>{new Date(photo.upload_time).toLocaleString()}</span>
        </div>
        {isOwner && (
          <div className="owner-actions">
            <Link to={`/photo/${id}/edit`} className="edit-button">编辑信息</Link>
            <button onClick={handleDelete} className="delete-button">删除图片</button>
          </div>
        )}
      </div>
    </div>
    <div className="photo-detail-container">
         <CommentSection photoId={photo.photo_id} />
      </div>
    </>
  );
}

export default PhotoDetail;