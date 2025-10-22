import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import CarouselModal from './CarouselModal';
import './Dashboard.css';

function Dashboard() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useContext(AuthContext);

  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/photos/my-photos', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('获取图片失败');
        }

        const data = await response.json();
        setPhotos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPhotos();
    }
  }, [token]); // 当 token 变化时重新获取

  // 打开轮播的函数
  const openCarousel = (index) => {
    setCurrentIndex(index);
    setIsCarouselOpen(true);
  };

  // 关闭轮播
  const closeCarousel = () => setIsCarouselOpen(false);

  // 切换到上一张
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? photos.length - 1 : prevIndex - 1));
  };

  // 切换到下一张
  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === photos.length - 1 ? 0 : prevIndex + 1));
  };

  if (loading) {
    return <div className="loading">正在加载您的图片...</div>;
  }

  if (error) {
    return <div className="error">错误: {error}</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>{user.username}的图库</h1>
        <p>这里是您上传的所有精彩瞬间。</p>
      </header>

      {photos.length === 0 ? (
        <div className="no-photos">您还没有上传任何图片。</div>
      ) : (
        <div className="photo-grid">
          {photos.map((photo, index) => (
            // 移除 Link, 添加 onClick 事件
            <div key={photo.photo_id} className="photo-card" onClick={() => openCarousel(index)}>
              <img src={photo.url} alt={photo.title} />
              <div className="photo-info">
                <h3>{photo.title}</h3>
                <p>{new Date(photo.upload_time).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 条件渲染轮播组件 */}
      {isCarouselOpen && (
        <CarouselModal
          photos={photos}
          currentIndex={currentIndex}
          onClose={closeCarousel}
          onPrev={goToPrevious}
          onNext={goToNext}
        />
      )}
    </div>
  );
}

export default Dashboard;