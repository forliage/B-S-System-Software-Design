import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { AuthContext } from '../context/AuthContext';
import './EditPhoto.css';

function EditPhoto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [photoUrl, setPhotoUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);

  const [adjustments, setAdjustments] = useState({
    brightness: 1,
    contrast: 1,
    saturate: 1,
  });
  const [activeFilter, setActiveFilter] = useState('');

  const imgRef = useRef(null);

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/photos/${id}`);
        if (!response.ok) throw new Error('无法加载图片信息');
        const data = await response.json();
        setPhotoUrl(data.photo.url);
        setTitle(data.photo.title);
        setDescription(data.photo.description || '');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPhoto();
  }, [id]);

  const handleAdjustmentChange = (e) => {
    const { name, value } = e.target;
    setAdjustments(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const imageStyle = {
    filter: `brightness(${adjustments.brightness}) contrast(${adjustments.contrast}) saturate(${adjustments.saturate}) ${activeFilter}`,
  };

  const handleSave = async () => {
    const cropData = completedCrop && completedCrop.width && completedCrop.height
      ? {
          left: Math.round(completedCrop.x),
          top: Math.round(completedCrop.y),
          width: Math.round(completedCrop.width),
          height: Math.round(completedCrop.height),
        }
      : null;

    const editPayload = {
      title,
      description,
      crop: cropData,
      filter: activeFilter,
      adjustments: {
          brightness: adjustments.brightness,
          contrast: adjustments.contrast,
          saturation: adjustments.saturate,
      },
    };

    try {
        const response = await fetch(`http://localhost:3001/api/photos/${id}/edit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(editPayload),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || '编辑失败');
        }

        alert('编辑成功！');
        navigate(`/photo/${id}`);
    } catch (err) {
        alert(`保存失败: ${err.message}`);
    }
  };

  if (loading) return <div>正在加载...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div className="edit-photo-container">
      <h2>高级编辑</h2>

      <div className="info-inputs">
        <div className="form-group">
          <label htmlFor="title">标题</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="description">描述</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </div>

      <div className="image-preview-container">
        <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)}>
          <img ref={imgRef} src={photoUrl} style={imageStyle} alt="Preview" />
        </ReactCrop>
      </div>

      <div className="edit-controls">
        <h4>调整</h4>
        <div className="control-sliders">
          <div className="slider-group">
            <label>亮度</label>
            <input type="range" name="brightness" min="0.5" max="2" step="0.1" value={adjustments.brightness} onChange={handleAdjustmentChange} />
          </div>
          <div className="slider-group">
            <label>对比度</label>
            <input type="range" name="contrast" min="0.5" max="2" step="0.1" value={adjustments.contrast} onChange={handleAdjustmentChange} />
          </div>
          <div className="slider-group">
            <label>饱和度</label>
            <input type="range" name="saturate" min="0" max="2" step="0.1" value={adjustments.saturate} onChange={handleAdjustmentChange} />
          </div>
        </div>

        <h4>滤镜</h4>
        <div className="filter-options">
            <div className={`filter-thumbnail ${activeFilter === '' ? 'active' : ''}`} onClick={() => setActiveFilter('')}>
                <img src={photoUrl} alt="Original" style={{filter: 'none'}} />
                <p>原图</p>
            </div>
            <div className={`filter-thumbnail ${activeFilter === 'grayscale(1)' ? 'active' : ''}`} onClick={() => setActiveFilter('grayscale(1)')}>
                <img src={photoUrl} alt="Grayscale" style={{filter: 'grayscale(1)'}}/>
                <p>黑白</p>
            </div>
            <div className={`filter-thumbnail ${activeFilter === 'sepia(1)' ? 'active' : ''}`} onClick={() => setActiveFilter('sepia(1)')}>
                <img src={photoUrl} alt="Sepia" style={{filter: 'sepia(1)'}} />
                <p>复古</p>
            </div>
        </div>
      </div>

      <div className="edit-buttons">
        <button className="save-button" onClick={handleSave}>保存更改</button>
        <button className="cancel-button" onClick={() => navigate(`/photo/${id}`)}>取消</button>
      </div>
    </div>
  );
}

export default EditPhoto;
