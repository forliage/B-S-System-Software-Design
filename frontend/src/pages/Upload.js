import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon } from 'lucide-react';

const Upload = () => {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('tags', tags);

        try {
            setMessage('Uploading...');
            await axios.post('/api/photos', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/');
        } catch (err) {
            console.error(err);
            setMessage(err.response?.data?.error || 'Upload failed');
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-2">
                <UploadIcon /> Upload Photo
            </h2>
            {message && <div className="bg-blue-100 text-blue-700 p-3 rounded mb-4">{message}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer relative">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept="image/*"
                    />
                    {file ? (
                        <p className="text-green-600 font-medium">{file.name}</p>
                    ) : (
                        <div className="text-gray-500 dark:text-gray-400">
                            <UploadIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                            <p>Drag & drop or click to select photo</p>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Title</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    <textarea
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white h-24"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Tags (comma separated)</label>
                    <input
                        type="text"
                        placeholder="beach, sunset, holiday"
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                    />
                </div>

                <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg">
                    Upload Photo
                </button>
            </form>
        </div>
    );
};

export default Upload;
