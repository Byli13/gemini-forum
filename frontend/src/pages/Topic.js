import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { topicService, postService } from '../services';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import './Topic.css';

const Topic = () => {
  const { topicId } = useParams();
  const { user, isAuthenticated, isModerator } = useAuth();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTopic();
  }, [topicId]);

  const loadTopic = async (page = 1) => {
    try {
      setLoading(true);
      const data = await topicService.getTopic(topicId, page);
      setTopic(data.topic);
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (err) {
      setError('Failed to load topic');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      setSubmitting(true);
      await postService.createPost(topicId, replyContent);
      setReplyContent('');
      loadTopic(pagination.page);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await postService.deletePost(postId);
      loadTopic(pagination.page);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete post');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!topic) return <div className="error">Topic not found</div>;

  return (
    <div className="container topic-page">
      <div className="topic-header">
        <div>
          <Link to="/" className="breadcrumb">Home</Link>
          <span> / </span>
          <Link to={`/forum/${topic.category_slug}/${topic.forum_slug}`} className="breadcrumb">
            {topic.forum_name}
          </Link>
          <span> / </span>
          <strong>{topic.title}</strong>
        </div>
      </div>

      {topic.is_locked && (
        <div className="alert alert-warning">
          🔒 This topic is locked. Only moderators can reply.
        </div>
      )}

      <div className="posts-list">
        {posts.map((post, index) => (
          <div key={post.id} className="post-item card">
            <div className="post-author">
              <div className="author-avatar">
                {post.author_avatar ? (
                  <img src={post.author_avatar} alt={post.author_username} />
                ) : (
                  <div className="avatar-placeholder">
                    {post.author_username?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="author-info">
                <strong>{post.author_username || 'Deleted User'}</strong>
                {post.author_role === 'admin' && <span className="badge badge-admin">Admin</span>}
                {post.author_role === 'moderator' && <span className="badge badge-mod">Mod</span>}
              </div>
              <div className="post-date">
                {format(new Date(post.created_at), 'PPP p')}
              </div>
            </div>
            
            <div className="post-content">
              <p>{post.content}</p>
              {post.is_edited && (
                <small className="edited-indicator">Edited {format(new Date(post.edited_at), 'PPP p')}</small>
              )}
            </div>
            
            {isAuthenticated && (user.id === post.user_id || isModerator) && (
              <div className="post-actions">
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="btn btn-danger btn-sm"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            onClick={() => loadTopic(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => loadTopic(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
          >
            Next
          </button>
        </div>
      )}

      {isAuthenticated && (!topic.is_locked || isModerator) && (
        <div className="reply-form card">
          <h3>Post Reply</h3>
          <form onSubmit={handleReply}>
            <div className="form-group">
              <textarea
                className="form-control"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                required
                minLength={10}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Posting...' : 'Post Reply'}
            </button>
          </form>
        </div>
      )}

      {!isAuthenticated && (
        <div className="card">
          <Link to="/login">Login</Link> or <Link to="/register">Register</Link> to reply
        </div>
      )}
    </div>
  );
};

export default Topic;
