import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo">
          <h1>Forum App</h1>
        </Link>
        
        <nav className="nav">
          <Link to="/">Home</Link>
          
          {isAuthenticated ? (
            <>
              <Link to={`/profile/${user.username}`}>Profile</Link>
              {user.role === 'admin' && <Link to="/admin">Admin</Link>}
              <button onClick={logout} className="btn btn-secondary btn-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
