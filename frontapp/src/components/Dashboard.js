import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import CarouselModal from './CarouselModal';
import './Dashboard.css';

function Dashboard() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useContext(AuthContext);

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('tag') || '');

  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      setError('');
      try {
        const tag = searchParams.get('tag');
        const url = tag 
          ? `http://localhost:3001/api/photos/my-photos?tag=${encodeURIComponent(tag)}`
          : 'http://localhost:3001/api/photos/my-photos';
        
        const response = await fetch(url, {
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
  }, [token, searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ tag: searchTerm.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleTagClick = (tag) => {
    setSearchTerm(tag);
    setSearchParams({ tag: tag });
  };

  const openCarousel = (index) => {
    setCurrentIndex(index);
    setIsCarouselOpen(true);
  };
  const closeCarousel = () => setIsCarouselOpen(false);
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? photos.length - 1 : prevIndex - 1));
  };
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
        <form onSubmit={handleSearch} className="search-form">
          <input 
            type="text" 
            placeholder="按标签搜索..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">搜索</button>
        </form>
      </header>

      {photos.length === 0 ? (
        <div className="no-photos">
          {searchParams.get('tag') ? '没有找到匹配该标签的图片。' : '您还没有上传任何图片。'}
        </div>
      ) : (
        <div className="photo-grid">
          {photos.map((photo, index) => (
            <div key={photo.photo_id} className="photo-card">
              <img src={photo.url} alt={photo.title} onClick={() => openCarousel(index)} />
              <div className="photo-info">
                <h3>{photo.title}</h3>
                <div className="tags-container">
                  {photo.tags && photo.tags.map(tag => (
                    <span key={tag} className="tag" onClick={(e) => { e.stopPropagation(); handleTagClick(tag); }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
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