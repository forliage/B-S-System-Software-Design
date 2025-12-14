import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

function EditPhoto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // 编辑状态
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [activeFilter, setActiveFilter] = useState('');
  const imgRef = useRef(null);

  const filters = [
    { name: '无', value: '' },
    { name: '鲜明', value: 'vivid' }, { name: '鲜暖色', value: 'vivid_warm' },
    { name: '鲜冷色', value: 'vivid_cool' }, { name: '反差色', value: 'dramatic' },
    { name: '反差暖色', value: 'dramatic_warm' }, { name: '反差冷色', value: 'dramatic_cool' },
    { name: '单色', value: 'mono' }, { name: '银色调', value: 'silvertone' },
    { name: '黑白', value: 'noir' },
  ];

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/photos/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('无法加载图片信息');
        const data = await response.json();
        setPhoto(data.photo);
        setTitle(data.photo.title);
        setDescription(data.photo.description || '');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPhoto();
  }, [id, token]);

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, 16 / 9, width, height),
      width,
      height
    );
    setCrop(crop);
  }

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setError('');

    // 更新元数据
    try {
      await fetch(`http://localhost:3001/api/photos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });
    } catch (err) {
      setError('元数据更新失败');
      setIsSaving(false);
      return;
    }

    // 应用图像编辑
    const editBody = {
      filter: activeFilter,
      crop: completedCrop && completedCrop.width > 0 ? {
        x: completedCrop.x,
        y: completedCrop.y,
        width: completedCrop.width,
        height: completedCrop.height,
      } : null,
    };

    try {
      const response = await fetch(`http://localhost:3001/api/photos/${id}/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editBody),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '图像编辑失败');
      }
      
      alert('修改已成功保存！');
      navigate(`/photo/${id}`);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (photo) {
      setTitle(photo.title);
      setDescription(photo.description || '');
      setActiveFilter('');
      onImageLoad({ currentTarget: imgRef.current });
    }
  };

  if (loading) return <div className="text-center mt-10"><p>正在加载...</p></div>;
  if (error && !photo) return <div className="text-center mt-10 text-red-500"><p>{error}</p></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">编辑图片</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-gray-800 p-4 rounded-lg shadow-lg flex items-center justify-center">
          {photo && (
            <ReactCrop
              crop={crop}
              onChange={c => setCrop(c)}
              onComplete={c => setCompletedCrop(c)}
              aspect={16 / 9}
            >
              <img ref={imgRef} src={photo.url} alt="待编辑图片" onLoad={onImageLoad} style={{ maxHeight: '70vh' }}/>
            </ReactCrop>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">标题</label>
            <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">描述</label>
            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows="3" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
          </div>
          <h2 className="text-xl font-semibold mb-4">滤镜效果</h2>
          <div className="grid grid-cols-2 gap-4">
            {filters.map(f => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`p-2 rounded-lg text-center transition-all ${activeFilter === f.value ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                {f.name}
              </button>
            ))}
          </div>
          {error && <div className="mt-4 text-red-500 text-sm text-center">{error}</div>}
          <div className="mt-8 pt-6 border-t flex justify-between">
            <button onClick={() => navigate(`/photo/${id}`)} className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
              放弃
            </button>
            <button onClick={handleReset} className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
              重置
            </button>
            <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-300">
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditPhoto;