import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Heart, Trash2, Edit, MessageCircle, Send } from 'lucide-react';

const PhotoDetail = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);

    // Comments
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState([]);

    useEffect(() => {
        fetchPhoto();
    }, [id]);

    const fetchPhoto = async () => {
        try {
            const res = await axios.get(`/api/photos/${id}`);
            setPhoto(res.data);
            setComments(res.data.comments || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this photo?')) return;
        try {
            await axios.delete(`/api/photos/${id}`);
            navigate('/');
        } catch (err) {
            alert('Failed to delete');
        }
    };

    const handleLike = async () => {
        try {
            const res = await axios.post(`/api/photos/${id}/like`);
            setPhoto(prev => ({
                ...prev,
                like_count: res.data.liked ? prev.like_count + 1 : prev.like_count - 1,
                isLiked: res.data.liked
            }));
        } catch (err) {
            alert('Login to like');
        }
    };

    const handleEdit = async (type) => { // type: grayscale, blur
        try {
            await axios.post(`/api/photos/${id}/edit`, { [type]: 1 });
            // For demo: reload page or fetch again. Filepath query param update handles cache.
            const res = await axios.get(`/api/photos/${id}`);
            setPhoto(prev => ({ ...prev, filepath: res.data.filepath + '?t=' + Date.now() }));
        } catch (err) {
            alert('Edit failed');
        }
    };

    const postComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            // Note: In a real app we need a separate /comments endpoint, but here we can append to photo detail or use a generic one.
            // Wait, looking at routes, I didn't create a specific comment route in `photoRoutes` or `server.js`!
            // I need to check if I have a comment route.
            // I do NOT have a comment route in `photoRoutes.js` summary.
            // I will add it briefly to `photoRoutes.js` and `photoController.js` or just skip if too complex now.
            // User requirement: "social interactions (liking, commenting)".
            // I MUST implement it.
            // I'll add `POST /api/photos/:id/comments` to `photoRoutes` and `photoController`.

            await axios.post(`/api/photos/${id}/comments`, { content: commentText });
            setCommentText('');
            fetchPhoto(); // Reload comments
        } catch (err) {
            alert('Failed to comment');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!photo) return <div>Photo not found</div>;

    const isOwner = user && (Number(user.id) === Number(photo.user_id) || user.role === 'ADMIN');

    return (
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-10">
            <div className="relative bg-black flex justify-center items-center min-h-[50vh]">
                <img src={photo.filepath} alt={photo.title} className="max-w-full max-h-[80vh]" />
                {editMode && (
                    <div className="absolute top-4 right-4 bg-white p-4 rounded shadow text-gray-800">
                        <h4 className="font-bold mb-2">Edit Tools</h4>
                        <button onClick={() => handleEdit('grayscale')} className="block w-full text-left px-2 py-1 hover:bg-gray-100">Make Grayscale</button>
                        <button onClick={() => handleEdit('blur')} className="block w-full text-left px-2 py-1 hover:bg-gray-100">Blur</button>
                        <button onClick={() => setEditMode(false)} className="mt-2 text-red-500 text-sm">Close Edit</button>
                    </div>
                )}
            </div>

            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-3xl font-bold dark:text-white mb-2">{photo.title || 'Untitled'}</h1>
                        <p className="text-gray-500">by {photo.username} on {new Date(photo.upload_time).toLocaleDateString()}</p>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={handleLike} className={`p-2 rounded-full border ${photo.isLiked ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-300 hover:bg-gray-50'}`}>
                            <Heart className={`w-6 h-6 ${photo.isLiked ? 'fill-current' : ''}`} /> {photo.like_count}
                        </button>
                        {isOwner && (
                            <>
                                <button onClick={() => setEditMode(!editMode)} className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 text-blue-500">
                                    <Edit className="w-6 h-6" />
                                </button>
                                <button onClick={handleDelete} className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 text-red-500">
                                    <Trash2 className="w-6 h-6" />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="mb-8 border-b dark:border-gray-700 pb-6">
                    <p className="text-gray-700 dark:text-gray-300 mb-4">{photo.description}</p>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                        {photo.exif_location && <span>📍 {photo.exif_location}</span>}
                        {photo.exif_time && <span>📅 {new Date(photo.exif_time).toLocaleString()}</span>}
                        {photo.resolution && <span>📐 {photo.resolution}</span>}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {photo.tags && photo.tags.map(tag => (
                            <span key={tag} className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm">#{tag}</span>
                        ))}
                    </div>
                </div>

                {/* Comments Section */}
                <div>
                    <h3 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                        <MessageCircle /> Comments ({comments.length})
                    </h3>

                    <div className="space-y-4 mb-6">
                        {comments.map(comment => (
                            <div key={comment.comment_id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold dark:text-white">{comment.username}</span>
                                    <span className="text-xs text-gray-500">{new Date(comment.comment_time).toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                            </div>
                        ))}
                    </div>

                    {user && (
                        <form onSubmit={postComment} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                className="flex-1 border rounded-lg px-4 py-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                            />
                            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PhotoDetail;
