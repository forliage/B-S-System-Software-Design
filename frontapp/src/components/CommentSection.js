import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './CommentSection.css';

function CommentSection({ photoId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, token, user } = useContext(AuthContext);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/photos/${photoId}/comments`);
        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error('无法加载评论:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [photoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`http://localhost:3001/api/photos/${photoId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });
      const addedComment = await response.json();
      if (response.ok) {
        setComments([...comments, addedComment]);
        setNewComment('');
      }
    } catch (error) {
      console.error('发表评论失败:', error);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('您确定要删除这条评论吗？')) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:3001/api/photos/${photoId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '删除失败');
      }
      setComments(comments.filter(comment => comment.comment_id !== commentId));
    } catch (err) {
      alert(`删除失败: ${err.message}`);
    }
  };

  if (loading) return <div>正在加载评论...</div>;

  return (
    <div className="comment-section">
      <h3>评论</h3>
      <ul className="comment-list">
        {comments.length > 0 ? (
          comments.map(comment => (
            <li key={comment.comment_id} className="comment-item">
              <div className="comment-header">
                <span className="comment-author">{comment.username}</span>
                <span className="comment-time">{new Date(comment.comment_time).toLocaleString()}</span>
              </div>
              <p className="comment-content">{comment.content}</p>
              {isAuthenticated && user && user.userId === comment.user_id && (
                <button onClick={() => handleDelete(comment.comment_id)} className="delete-comment-button">
                  删除
                </button>
              )}
            </li>
          ))
        ) : (
          <p>暂无评论，快来抢沙发吧！</p>
        )}
      </ul>
      {isAuthenticated && (
        <form className="comment-form" onSubmit={handleSubmit}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="写下你的评论..."
            required
          />
          <button type="submit">发表</button>
        </form>
      )}
    </div>
  );
}

export default CommentSection;
