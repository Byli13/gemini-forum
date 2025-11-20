import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { topicService, forumService } from '../services';
import './NewTopic.css';

const NewTopic = () => {
  const { categorySlug, forumSlug } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      // Get forum ID
      const forumData = await forumService.getForum(categorySlug, forumSlug);
      const forumId = forumData.forum.id;

      // Create topic
      const result = await topicService.createTopic(forumId, title, content);
      navigate(`/topic/${result.topic.id}`);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.details?.[0]?.message || 'Failed to create topic');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container new-topic-page">
      <div className="card">
        <h2>Create New Topic</h2>
        
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={5}
              maxLength={255}
              placeholder="Enter topic title..."
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Content</label>
            <textarea
              className="form-control"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              minLength={10}
              rows={10}
              placeholder="Write your message..."
            />
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Topic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTopic;
