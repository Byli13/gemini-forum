'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Redirect if not authenticated (client-side check)
  if (!isAuthenticated && typeof window !== 'undefined') {
    router.push('/login');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      
      await axios.post(
        `${apiUrl}/posts`,
        { title, content, category },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      router.push('/');
    } catch (error) {
      console.error('Failed to create post', error);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center pt-20">
      <Card className="w-full max-w-2xl p-8 space-y-8 border-neon-blue/20">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Start a Discussion</h1>
          <p className="text-gray-400">Share your thoughts with the community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's on your mind?"
                required
                maxLength={100}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 ml-1 mb-2 block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-space-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/50 transition-all duration-200"
              >
                <option value="General">General</option>
                <option value="Tech">Tech</option>
                <option value="Random">Random</option>
                <option value="News">News</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-space-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/50 transition-all duration-200 min-h-[200px] resize-none"
              placeholder="Elaborate on your topic..."
              required
              maxLength={5000}
            />
          </div>

          <div className="flex gap-4">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Post Discussion
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
