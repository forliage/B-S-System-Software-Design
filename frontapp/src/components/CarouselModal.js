import React, { useEffect } from 'react';
import './CarouselModal.css';

function CarouselModal({ photos, currentIndex, onClose, onPrev, onNext }) {
  // 处理键盘事件
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    // 清理事件监听器
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onPrev, onNext]);

  // 防止在 photos 为空时出错
  if (!photos || photos.length === 0) {
    return null;
  }

  const currentPhoto = photos[currentIndex];

  return (
    <div className="carousel-modal-backdrop" onClick={onClose}>
      <div className="carousel-modal-content" onClick={(e) => e.stopPropagation()}>
        <img src={currentPhoto.url} alt={currentPhoto.title} />

        <button className="carousel-close-btn" onClick={onClose}>×</button>
        <button className="carousel-nav-btn carousel-prev-btn" onClick={onPrev}>‹</button>
        <button className="carousel-nav-btn carousel-next-btn" onClick={onNext}>›</button>
        
        <div className="carousel-info">
            <h3>{currentPhoto.title}</h3>
            <p>{currentIndex + 1} / {photos.length}</p>
        </div>
      </div>
    </div>
  );
}

export default CarouselModal;