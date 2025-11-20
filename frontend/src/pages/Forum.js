import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { forumService, topicService } from '../services';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import './Forum.css';

const Forum = () => {
  const { categorySlug, forumSlug } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [forum, setForum] = useState(null);
  const [topics, setTopics] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadForum();
  }, [categorySlug, forumSlug]);

  const loadForum = async (page = 1) => {
    try {
      setLoading(true);
      const data = await forumService.getForum(categorySlug, forumSlug, page);
      setForum(data.forum);
      setTopics(data.topics);
      setPagination(data.pagination);
    } catch (err) {
      setError('Failed to load forum');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopic = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/forum/${categorySlug}/${forumSlug}/new-topic`);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!forum) return <div className="error">Forum not found</div>;

  return (
    <div className="container forum-page">
      <div className="forum-header">
        <div>
          <Link to="/" className="breadcrumb">Home</Link>
          <span> / </span>
          <span className="breadcrumb">{forum.category_name}</span>
          <span> / </span>
          <strong>{forum.name}</strong>
        </div>
        
        <button onClick={handleCreateTopic} className="btn btn-primary">
          New Topic
        </button>
      </div>

      <p className="forum-description">{forum.description}</p>

      <div className="topics-list">
        {topics.length === 0 ? (
          <div className="card">No topics yet. Be the first to create one!</div>
        ) : (
          topics.map((topic) => (
            <Link
              key={topic.id}
              to={`/topic/${topic.id}`}
              className="topic-item card"
            >
              <div className="topic-info">
                {topic.is_pinned && <span className="badge badge-pin">📌 Pinned</span>}
                {topic.is_locked && <span className="badge badge-lock">🔒 Locked</span>}
                <h4>{topic.title}</h4>
                <div className="topic-meta">
                  <span>By {topic.author_username}</span>
                  <span>•</span>
                  <span>{format(new Date(topic.created_at), 'PPP')}</span>
                </div>
              </div>
              <div className="topic-stats">
                <div className="stat">
                  <strong>{topic.post_count || 0}</strong>
                  <span>Replies</span>
                </div>
                <div className="stat">
                  <strong>{topic.view_count || 0}</strong>
                  <span>Views</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            onClick={() => loadForum(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => loadForum(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Forum;
