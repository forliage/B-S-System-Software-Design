import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Upload.css';

function Upload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // 创建图片预览
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('请选择一个图片文件');
      setIsError(true);
      return;
    }

    setUploading(true);
    setMessage('');
    setIsError(false);

    const formData = new FormData();
    formData.append('image', file); // 'image' 必须与后端 multer 的字段名一致
    formData.append('title', title);
    formData.append('description', description);

    try {
      const response = await fetch('http://localhost:3001/api/photos/upload', {
        method: 'POST',
        headers: {
          // 注意：使用 FormData 时，浏览器会自动设置 Content-Type，我们不需要手动设置
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('图片上传成功！');
        setIsError(false);
        setTimeout(() => navigate('/dashboard'), 1500); // 1.5秒后跳转
      } else {
        setMessage(data.error || '上传失败');
        setIsError(true);
      }
    } catch (err) {
      setMessage('无法连接到服务器');
      setIsError(true);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <form className="upload-form" onSubmit={handleSubmit}>
        <h2>上传新图片</h2>
        {message && <div className={`message ${isError ? 'error' : 'success'}`}>{message}</div>}
        
        <div className="form-group">
          <label htmlFor="file">选择图片</label>
          <input type="file" id="file" onChange={handleFileChange} accept="image/*" required />
        </div>

        {preview && (
          <div className="preview-container">
            <p>图片预览:</p>
            <img src={preview} alt="Preview" className="image-preview" />
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="title">标题</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">描述 (可选)</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="4" />
        </div>
        
        <button type="submit" className="upload-button" disabled={uploading}>
          {uploading ? '正在上传...' : '上传'}
        </button>
      </form>
    </div>
  );
}

export default Upload;