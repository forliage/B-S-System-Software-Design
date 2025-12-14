import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import CommentSection from './CommentSection';

function PhotoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

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
        
        if (!response.ok) throw new Error('图片未找到或加载失败');
        
        const data = await response.json();
        setPhoto(data.photo);
        setIsLiked(data.isLiked);
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
    if (!window.confirm('您确定要永久删除这张图片吗？')) return;
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
    if (!isAuthenticated) return navigate('/login');
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
    } catch (err) { console.error('点赞失败', err); }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) return navigate('/login');
    try {
      const response = await fetch(`http://localhost:3001/api/photos/${id}/favorite`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setIsFavorited(data.favorited);
      }
    } catch (err) { console.error('收藏失败', err); }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
        <p>正在加载...</p>
    </div>
  );
  if (error) return (
    <div className="text-center mt-10">
        <p className="mt-4 text-lg text-red-700">错误: {error}</p>
    </div>
  );
  if (!photo) return <div className="text-center mt-10 text-lg text-gray-600">未找到图片。</div>;

  const isOwner = user && user.userId === photo.user_id;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden md:flex">
        <div className="md:w-1/2">
          <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
        </div>
        <div className="md:w-1/2 p-8 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{photo.title}</h1>
            <p className="text-gray-600 mb-6">{photo.description || '暂无描述'}</p>

            <div className="text-gray-500 mb-2">
              <span>{new Date(photo.upload_time).toLocaleString()}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {photo.tags && photo.tags.length > 0 ? photo.tags.map(tag => (
                <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">#{tag}</span>
              )) : <span className="text-gray-500 text-sm">无标签</span>}
            </div>
          </div>
          
          <div>
            <div className="flex items-center space-x-6 mt-8">
              <button onClick={handleLike} className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors">
                <span>{isLiked ? '❤️' : '🤍'}</span>
                <span>{likeCount} 赞</span>
              </button>
              <button onClick={handleFavorite} className="flex items-center space-x-2 text-gray-600 hover:text-yellow-500 transition-colors">
                <span>{isFavorited ? '⭐' : '☆'}</span>
                <span>{isFavorited ? '已收藏' : '收藏'}</span>
              </button>
            </div>

            {isOwner && (
              <div className="flex items-center space-x-4 mt-6 border-t pt-6">
                <Link to={`/photo/${id}/edit`} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  编辑
                </Link>
                <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                  删除
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-white shadow-xl rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">评论区</h2>
        <CommentSection photoId={photo.photo_id} />
      </div>
    </div>
  );
}

export default PhotoDetail;