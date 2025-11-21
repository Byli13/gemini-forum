'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Bell, MessageSquare, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: 'MENTION_POST' | 'MENTION_COMMENT';
  isRead: boolean;
  sender: { username: string; avatarUrl?: string };
  post?: { id: string; title: string };
  comment?: { id: string; content: string };
  createdAt: string;
}

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      router.push('/login');
      return;
    }

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await axios.get(`${apiUrl}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data);
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [isAuthenticated, router]);

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      await axios.patch(`${apiUrl}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  if (loading) {
    return <div className="pt-24 text-center text-gray-400">Loading notifications...</div>;
  }

  return (
    <div className="pt-24 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Bell className="w-8 h-8 text-neon-blue" />
        <h1 className="text-3xl font-bold text-white">Notifications</h1>
      </div>

      {notifications.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-400">No notifications yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`transition-colors ${notification.isRead ? 'opacity-70' : 'border-neon-blue/30 bg-neon-blue/5'}`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {notification.type === 'MENTION_POST' ? (
                    <FileText className="w-5 h-5 text-neon-purple" />
                  ) : (
                    <MessageSquare className="w-5 h-5 text-neon-pink" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-gray-300">
                    <span className="font-semibold text-white">@{notification.sender.username}</span>
                    {' '}mentioned you in{' '}
                    {notification.type === 'MENTION_POST' ? 'a post' : 'a comment'}
                  </p>
                  
                  {notification.post && (
                    <Link 
                      href={`/posts/${notification.post.id}`}
                      className="block mt-2 text-neon-blue hover:underline"
                      onClick={() => !notification.isRead && markAsRead(notification.id)}
                    >
                      {notification.post.title}
                    </Link>
                  )}

                  {notification.comment && (
                    <div className="mt-2 p-3 bg-black/20 rounded text-sm text-gray-400 italic border-l-2 border-gray-600">
                      "{notification.comment.content.substring(0, 100)}{notification.comment.content.length > 100 ? '...' : ''}"
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                {!notification.isRead && (
                  <Button size="sm" variant="ghost" onClick={() => markAsRead(notification.id)}>
                    Mark read
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
