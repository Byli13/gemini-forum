'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/Button';
import { motion } from 'framer-motion';
import { User, Gem, Bell, X, MessageSquare, FileText } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Card } from './ui/Card';

interface Notification {
  id: string;
  type: 'MENTION_POST' | 'MENTION_COMMENT';
  isRead: boolean;
  sender: { username: string; avatarUrl?: string };
  post?: { id: string; title: string };
  comment?: { id: string; content: string };
  createdAt: string;
}

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await axios.get(`${apiUrl}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const toggleNotifications = () => {
    if (!showNotifications) {
      fetchNotifications();
    }
    setShowNotifications(!showNotifications);
  };

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      await axios.patch(`${apiUrl}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const fetchUnread = async () => {
        try {
          const token = localStorage.getItem('token');
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
          const res = await axios.get(`${apiUrl}/notifications/unread-count`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUnreadCount(res.data);
        } catch (e) {
          console.error(e);
        }
      };
      fetchUnread();
      const interval = setInterval(fetchUnread, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10"
    >
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Gem className="w-6 h-6 text-neon-blue group-hover:animate-spin-slow" />
            <div className="absolute inset-0 bg-neon-blue blur-lg opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-neon-blue transition-all">
            Gem
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={toggleNotifications}
                  className="relative mr-2 p-2 rounded-full hover:bg-white/5 transition-colors"
                >
                  <Bell className={`w-5 h-5 transition-colors ${showNotifications ? 'text-white' : 'text-gray-400 hover:text-white'}`} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-neon-pink rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0B0C15] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-xl">
                      <h3 className="font-semibold text-white">Notifications</h3>
                      <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      {loadingNotifications ? (
                        <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
                      ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">No notifications yet</div>
                      ) : (
                        <div className="divide-y divide-white/5">
                          {notifications.map((notification) => (
                            <div 
                              key={notification.id}
                              className={`p-4 hover:bg-white/5 transition-colors ${!notification.isRead ? 'bg-neon-blue/5' : ''}`}
                            >
                              <div className="flex gap-3">
                                <div className="mt-1">
                                  {notification.type === 'MENTION_POST' ? (
                                    <FileText className="w-4 h-4 text-neon-purple" />
                                  ) : (
                                    <MessageSquare className="w-4 h-4 text-neon-pink" />
                                  )}
                                </div>
                                <div className="flex-1 space-y-1">
                                  <p className="text-sm text-gray-300">
                                    <span className="font-semibold text-white">@{notification.sender.username}</span>
                                    {' '}mentioned you in{' '}
                                    {notification.type === 'MENTION_POST' ? 'a post' : 'a comment'}
                                  </p>
                                  
                                  {notification.post && (
                                    <Link 
                                      href={`/posts/${notification.post.id}`}
                                      className="block text-xs text-neon-blue hover:underline truncate"
                                      onClick={() => {
                                        if (!notification.isRead) markAsRead(notification.id);
                                        setShowNotifications(false);
                                      }}
                                    >
                                      {notification.post.title}
                                    </Link>
                                  )}

                                  {notification.comment && (
                                    <p className="text-xs text-gray-500 italic truncate">
                                      "{notification.comment.content}"
                                    </p>
                                  )}
                                  
                                  <p className="text-[10px] text-gray-600">
                                    {new Date(notification.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                {!notification.isRead && (
                                  <button 
                                    onClick={() => markAsRead(notification.id)}
                                    className="h-2 w-2 rounded-full bg-neon-blue mt-2"
                                    title="Mark as read"
                                  />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="p-2 border-t border-white/10 bg-white/5 text-center">
                      <Link 
                        href="/notifications" 
                        className="text-xs text-gray-400 hover:text-white transition-colors"
                        onClick={() => setShowNotifications(false)}
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link href={`/profile/${user?.username}`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </Button>
              </Link>
              <Button variant="ghost" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
