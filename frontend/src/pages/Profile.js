import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const [photos, setPhotos] = useState([]);
    const [stats, setStats] = useState({ likes: 0, count: 0 });

    useEffect(() => {
        if (user) {
            fetchUserPhotos();
        }
    }, [user]);

    const fetchUserPhotos = async () => {
        try {
            const res = await axios.get(`/api/photos?user_id=${user.id}`);
            setPhotos(res.data);

            const totalLikes = res.data.reduce((acc, curr) => acc + (curr.like_count || 0), 0);
            setStats({ likes: totalLikes, count: res.data.length });
        } catch (err) {
            console.error(err);
        }
    };

    if (!user) return <div>Please login</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 flex items-center gap-6">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">{user.username}</h1>
                    <p className="text-gray-500">{user.email}</p>
                    <div className="flex gap-4 mt-2">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">{stats.count} Photos</span>
                        <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-semibold">{stats.likes} Likes received</span>
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-bold mb-4 dark:text-white">My Photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map(photo => (
                    <Link to={`/photos/${photo.photo_id}`} key={photo.photo_id} className="block relative group rounded-lg overflow-hidden">
                        <img
                            src={photo.thumbnail_path || photo.filepath}
                            alt={photo.title}
                            className="w-full h-40 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all" />
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Profile;
