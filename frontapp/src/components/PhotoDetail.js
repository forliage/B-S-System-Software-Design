import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import CommentSection from './CommentSection';
import CarouselModal from './CarouselModal';
import './PhotoDetail.css';

function PhotoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [photo, setPhoto] = useState(null);
  const [userPhotos, setUserPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { user, token, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const fetchPhoto = async () => {
      setLoading(true);
      setError('');
      try {
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`http://localhost:3001/api/photos/${id}`, { headers });
        
        if (!response.ok) {
          throw new Error('图片未找到或加载失败');
        }
        
        const data = await response.json();
        setPhoto(data.photo);
        setUserPhotos(data.userPhotos);
        setIsLiked(data.isLiked);
        setIsFavorited(data.isFavorited);
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
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '删除失败');
      }
      alert('图片删除成功！');
      navigate('/dashboard');
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

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      alert('请先登录再收藏！');
      navigate('/login');
      return;
    }
    try {
      const response = await fetch(`http://localhost:3001/api/photos/${id}/favorite`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setIsFavorited(data.favorited);
      }
    } catch (err) {
      console.error('收藏失败', err);
    }
  };
  
  const openCarousel = () => {
    const index = userPhotos.findIndex(p => p.photo_id === photo.photo_id);
    if (index !== -1) {
        setCurrentIndex(index);
        setIsCarouselOpen(true);
    }
  };
  const closeCarousel = () => setIsCarouselOpen(false);
  const goToPrevious = () => {
      setCurrentIndex(prev => (prev === 0 ? userPhotos.length - 1 : prev - 1));
  };
  const goToNext = () => {
      setCurrentIndex(prev => (prev === userPhotos.length - 1 ? 0 : prev + 1));
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

  const isOwner = user && user.userId === photo.user_id;

  return (
    <>
      <div className="photo-detail-container">
        <div className="photo-image-container" onClick={openCarousel}>
          <img src={photo.url} alt={photo.title} />
        </div>
        <div className="photo-meta-container">
          <h2>{photo.title}</h2>
          <p>{photo.description || '暂无描述'}</p>
          
          <div className="meta-item tags-container-detail">
            <strong>标签:</strong>
            {photo.tags && photo.tags.length > 0 ? photo.tags.map(tag => (
              <span key={tag} className="tag-detail">#{tag}</span>
            )) : '无'}
          </div>

          <div className="actions-section">
            <button onClick={handleLike} className={`action-button ${isLiked ? 'liked' : ''}`}>
              <span className="icon">{isLiked ? '♥' : '♡'}</span>
              {isLiked ? '已赞' : '点赞'} ({likeCount})
            </button>
            <button onClick={handleFavorite} className={`action-button ${isFavorited ? 'favorited' : ''}`}>
              <span className="icon">{isFavorited ? '★' : '☆'}</span>
              {isFavorited ? '已收藏' : '收藏'}
            </button>
          </div>
          
          <div className="meta-grid">
            <div className="meta-item">
              <strong>上传时间:</strong>
              <span>{new Date(photo.upload_time).toLocaleString()}</span>
            </div>
            {photo.exif_time && (
              <div className="meta-item">
                <strong>拍摄时间:</strong>
                <span>{new Date(photo.exif_time).toLocaleString()}</span>
              </div>
            )}
            {photo.resolution && (
              <div className="meta-item">
                <strong>分辨率:</strong>
                <span>{photo.resolution}</span>
              </div>
            )}
          </div>

          {isOwner && (
            <div className="owner-actions">
              <Link to={`/photo/${id}/edit`} className="edit-button">高级编辑</Link>
              <button onClick={handleDelete} className="delete-button">删除图片</button>
            </div>
          )}
        </div>
      </div>
      
      <div className="photo-detail-container">
        <CommentSection photoId={photo.photo_id} />
      </div>

      {isCarouselOpen && (
        <CarouselModal
            photos={userPhotos}
            currentIndex={currentIndex}
            onClose={closeCarousel}
            onPrev={goToPrevious}
            onNext={goToNext}
        />
      )}
    </>
  );
}

export default PhotoDetail;