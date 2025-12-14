import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Dashboard() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useContext(AuthContext);

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('tag') || '');

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

  const handleTagClick = (tag, e) => {
    e.stopPropagation();
    setSearchTerm(tag);
    setSearchParams({ tag: tag });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-xl text-gray-600">正在加载您的图片...</span>
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
        <h1 className="text-4xl font-bold text-gray-800 mb-2">欢迎回来, {user.username}!</h1>
        <p className="text-lg text-gray-600">这里是您上传的所有精彩瞬间。</p>
        <form onSubmit={handleSearch} className="mt-6 max-w-lg mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="按标签搜索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3 pl-4 pr-12 text-gray-700 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="absolute top-0 right-0 mt-2 mr-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
              搜索
            </button>
          </div>
        </form>
      </header>

      {photos.length === 0 ? (
        <div className="text-center text-gray-500 mt-16">
          <h2 className="text-2xl font-semibold">
            {searchParams.get('tag') ? '没有找到匹配的图片' : '您的图库还是空的'}
          </h2>
          <p className="mt-2">
            {searchParams.get('tag')
              ? '请尝试其他标签或清除搜索条件。'
              : '立刻上传您的第一张照片吧！'}
          </p>
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
                    <button key={tag} onClick={(e) => handleTagClick(tag, e)} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs hover:bg-gray-200">
                      #{tag}
                    </button>
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

export default Dashboard;