import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Favorites() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('http://localhost:3001/api/photos/favorites', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('获取收藏图片失败');
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
      fetchFavorites();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-xl text-gray-600">正在加载您的收藏...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 bg-red-50 p-4 rounded-lg">
        <span className="text-xl text-red-700">错误: {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">我的收藏</h1>
        <p className="text-lg text-gray-600">这里是您收藏的所有精彩图片。</p>
      </header>

      {photos.length === 0 ? (
        <div className="text-center text-gray-500 mt-16">
          <h2 className="text-2xl font-semibold">您的收藏夹还是空的</h2>
          <p className="mt-2">快去发现并收藏您喜欢的照片吧！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {photos.map((photo) => (
            <Link to={`/photo/${photo.photo_id}`} key={photo.photo_id} className="group block bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
              <div className="relative">
                <img src={photo.url} alt={photo.title} className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 truncate">{photo.title}</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {photo.tags && photo.tags.map(tag => (
                    <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;