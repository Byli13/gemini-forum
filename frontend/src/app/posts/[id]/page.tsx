'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { MessageSquare, ThumbsUp, Heart, Star } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    username: string;
  };
}

interface Reaction {
  id: string;
  type: 'LIKE' | 'LOVE' | 'SUPPORT';
  user: {
    id: string;
  };
}

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: {
    username: string;
  };
  comments: Comment[];
  reactions: Reaction[];
}

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState('');
  const { isAuthenticated } = useAuth();

  const fetchPost = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await axios.get(`${apiUrl}/posts/${id}`);
      setPost(response.data);
    } catch (error) {
      console.error('Failed to fetch post', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      await axios.post(
        `${apiUrl}/comments`,
        { content: newComment, postId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment('');
      fetchPost();
    } catch (error) {
      console.error('Failed to post comment', error);
    }
  };

  const handleReaction = async (type: 'LIKE' | 'LOVE' | 'SUPPORT') => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      await axios.post(
        `${apiUrl}/reactions`,
        { postId: id, type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPost();
    } catch (error) {
      console.error('Failed to react', error);
    }
  };

  if (!post) return <div className="pt-24 text-center text-white">Loading...</div>;

  const reactionCounts = post.reactions.reduce((acc, reaction) => {
    acc[reaction.type] = (acc[reaction.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="pt-24 max-w-4xl mx-auto space-y-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="space-y-6 border-neon-blue/30">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white">{post.title}</h1>
            <div className="flex items-center gap-4 text-gray-400 text-sm">
              <span>Posted by @{post.author?.username || 'Unknown'}</span>
              <span>•</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-white/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction('LIKE')}
              className="gap-2 hover:text-neon-blue"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{reactionCounts['LIKE'] || 0}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction('LOVE')}
              className="gap-2 hover:text-neon-pink"
            >
              <Heart className="w-4 h-4" />
              <span>{reactionCounts['LOVE'] || 0}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction('SUPPORT')}
              className="gap-2 hover:text-neon-purple"
            >
              <Star className="w-4 h-4" />
              <span>{reactionCounts['SUPPORT'] || 0}</span>
            </Button>
          </div>
        </Card>
      </motion.div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-neon-blue" />
          Comments ({post.comments.length})
        </h2>

        {isAuthenticated ? (
          <form onSubmit={handleCommentSubmit} className="space-y-4">
            <div className="relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add to the discussion..."
                className="w-full bg-space-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/50 transition-all duration-200 min-h-[100px]"
              />
              <div className="absolute bottom-3 right-3">
                <Button type="submit" size="sm">
                  Post Comment
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <Card className="text-center py-8 bg-space-800/50">
            <p className="text-gray-400">Please login to join the discussion</p>
          </Card>
        )}

        <div className="space-y-4">
          {post.comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="bg-space-800/30 border-white/5">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-neon-blue">
                    @{comment.author?.username || 'Unknown'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-300">{comment.content}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
