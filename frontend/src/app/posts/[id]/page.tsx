'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState('');
  const [reacting, setReacting] = useState(false);
  const { isAuthenticated, user } = useAuth();

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
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!post) return;
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    // optimistic update
    const prev = post;
    const optimistic = { ...post, reactions: [...post.reactions] } as Post;

    if (user?.id) {
      const existingIdx = optimistic.reactions.findIndex((r) => r.user?.id === user.id);
      if (existingIdx !== -1) {
        const existing = optimistic.reactions[existingIdx];
        if (existing.type === type) {
          // remove reaction
          optimistic.reactions.splice(existingIdx, 1);
        } else {
          // change type
          optimistic.reactions[existingIdx] = { ...existing, type } as Reaction;
        }
      } else {
        // add temporary reaction
        optimistic.reactions.push({ id: 'temp-' + Date.now(), type, user: { id: user.id } } as Reaction);
      }
    } else {
      // fallback: just increment selected type count by adding a temp reaction
      optimistic.reactions.push({ id: 'temp-' + Date.now(), type, user: { id: 'unknown' } } as Reaction);
    }

    setPost(optimistic);
    setReacting(true);

    try {
      const resp = await axios.post(
        `${apiUrl}/reactions`,
        { postId: id, type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // backend now returns the updated post object
      if (resp?.data) {
        setPost(resp.data);
      } else {
        // fallback to re-fetch
        fetchPost();
      }
    } catch (error) {
      console.error('Failed to react', error);
      // revert on error
      setPost(prev);
    } finally {
      setReacting(false);
    }
  };

  if (!post) return <div className="pt-24 text-center text-white">Loading...</div>;

  const reactionCounts = post.reactions.reduce((acc, reaction) => {
    acc[reaction.type] = (acc[reaction.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const userReactionType = user ? post.reactions.find(r => r.user?.id === user.id)?.type : null;

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
              className={`gap-2 ${userReactionType === 'LIKE' ? 'text-neon-blue bg-neon-blue/10' : 'hover:text-neon-blue'}`}
            >
              <ThumbsUp className={`w-4 h-4 ${userReactionType === 'LIKE' ? 'fill-current' : ''}`} />
              <span>{reactionCounts['LIKE'] || 0}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction('LOVE')}
              className={`gap-2 ${userReactionType === 'LOVE' ? 'text-neon-pink bg-neon-pink/10' : 'hover:text-neon-pink'}`}
            >
              <Heart className={`w-4 h-4 ${userReactionType === 'LOVE' ? 'fill-current' : ''}`} />
              <span>{reactionCounts['LOVE'] || 0}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction('SUPPORT')}
              className={`gap-2 ${userReactionType === 'SUPPORT' ? 'text-neon-purple bg-neon-purple/10' : 'hover:text-neon-purple'}`}
            >
              <Star className={`w-4 h-4 ${userReactionType === 'SUPPORT' ? 'fill-current' : ''}`} />
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
