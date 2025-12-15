import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { MessageSquare, Heart } from 'lucide-react';
import AIChat from '../components/AIChat';

const Home = () => {
    const [photos, setPhotos] = useState([]);
    const [searchParams] = useSearchParams();
    const keyword = searchParams.get('keyword');
    const tag = searchParams.get('tag');

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const params = {};
                if (keyword) params.keyword = keyword;
                if (tag) params.tag = tag;
                const res = await axios.get('/api/photos', { params });
                setPhotos(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchPhotos();
    }, [keyword, tag]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold dark:text-white">
                    {keyword ? `Search: "${keyword}"` : tag ? `Tag: #${tag}` : 'Gallery'}
                </h1>
                <Link to="/upload" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 block md:hidden">
                    Upload
                </Link>
            </div>

            {photos.length === 0 ? (
                <div className="text-center text-gray-500 py-10">No photos found.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {photos.map(photo => (
                        <Link to={`/photos/${photo.photo_id}`} key={photo.photo_id} className="group block bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="aspect-w-4 aspect-h-3 overflow-hidden">
                                <img
                                    src={photo.thumbnail_path || photo.filepath}
                                    alt={photo.title}
                                    className="object-cover w-full h-48 group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-lg truncate dark:text-white">{photo.title || 'Untitled'}</h3>
                                <div className="flex justify-between items-center mt-2 text-gray-500 text-sm">
                                    <span>@{photo.username}</span>
                                    <div className="flex gap-3">
                                        <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {photo.like_count}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <AIChat />
        </div>
    );
};

export default Home;
