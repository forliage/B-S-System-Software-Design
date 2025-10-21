import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Dashboard.css';

function Dashboard() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useContext(AuthContext);

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
          {photos.map((photo) => (
            <div key={photo.photo_id} className="photo-card">
              <img src={photo.url} alt={photo.title} />
              <div className="photo-info">
                <h3>{photo.title}</h3>
                <p>{new Date(photo.upload_time).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;