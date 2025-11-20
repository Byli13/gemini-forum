import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { forumService } from '../services';
import './Home.css';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadForums();
  }, []);

  const loadForums = async () => {
    try {
      setLoading(true);
      const data = await forumService.getForums();
      setCategories(data);
    } catch (err) {
      setError('Failed to load forums');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading forums...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container home">
      <h2>Welcome to the Forum</h2>
      
      {categories.map((category) => (
        <div key={category.id} className="category">
          <h3 className="category-name">{category.name}</h3>
          
          <div className="forums-list">
            {category.forums.map((forum) => (
              <Link
                key={forum.id}
                to={`/forum/${category.slug}/${forum.slug}`}
                className="forum-item card"
              >
                <div className="forum-info">
                  <h4>{forum.name}</h4>
                  <p>{forum.description}</p>
                </div>
                <div className="forum-stats">
                  <div className="stat">
                    <strong>{forum.topicCount}</strong>
                    <span>Topics</span>
                  </div>
                  <div className="stat">
                    <strong>{forum.postCount}</strong>
                    <span>Posts</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Home;
