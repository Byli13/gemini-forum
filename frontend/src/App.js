import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Forum from './pages/Forum';
import Topic from './pages/Topic';
import NewTopic from './pages/NewTopic';
import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forum/:categorySlug/:forumSlug" element={<Forum />} />
              <Route path="/forum/:categorySlug/:forumSlug/new-topic" element={<NewTopic />} />
              <Route path="/topic/:topicId" element={<Topic />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
