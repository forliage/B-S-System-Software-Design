import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Dashboard.css'; // Reusing dashboard styles for a consistent look

function Favorites() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/photos/favorites', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('无法加载收藏夹');
        }
        const data = await response.json();
        setPhotos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, [token]);

  if (loading) return <div>正在加载...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div className="dashboard-container">
      <h2>我的收藏</h2>
      {photos.length > 0 ? (
        <div className="photo-grid">
          {photos.map(photo => (
            <Link to={`/photo/${photo.photo_id}`} key={photo.photo_id} className="photo-card">
              <img src={photo.thumbnail_url || photo.url} alt={photo.title} />
              <div className="photo-info">
                <h3>{photo.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p>您还没有收藏任何照片。</p>
      )}
    </div>
  );
}

export default Favorites;
