'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { MessageSquare, ThumbsUp, Heart, Star, Pencil, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const RichText = ({ content }: { content: string }) => {
  if (!content) return null;
  const parts = content.split(/(@\w+)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.match(/^@\w+$/)) {
          const username = part.substring(1);
          return (
            <Link 
              key={i} 
              href={`/profile/${username}`}
              className="text-neon-blue hover:underline font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        }
        return part;
      })}
    </span>
  );
};

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
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
  updatedAt: string;
  author: {
    id: string;
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
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showCommentDeleteModal, setShowCommentDeleteModal] = useState(false);
  const [commentToDeleteId, setCommentToDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');
  
  // Comment editing state
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');

  const { isAuthenticated, user } = useAuth();

  const fetchPost = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await axios.get(`${apiUrl}/posts/${id}`);
      setPost(response.data);
      setEditTitle(response.data.title);
      setEditContent(response.data.content);
    } catch (error) {
      console.error('Failed to fetch post', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPost();
      
      // Mark as visited
      const visited = JSON.parse(localStorage.getItem('visitedPosts') || '[]');
      if (!visited.includes(id)) {
        localStorage.setItem('visitedPosts', JSON.stringify([...visited, id]));
      }
    }
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      await axios.patch(
        `${apiUrl}/posts/${id}`,
        { title: editTitle, content: editContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEditing(false);
      fetchPost();
    } catch (error) {
      console.error('Failed to update post', error);
    }
  };

  const handleDelete = async () => {
    setDeleteError('');
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await axios.delete(
        `${apiUrl}/posts/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowDeleteModal(false);
      setSuccessMessage(response.data.message);
      setShowSuccessModal(true);
      
      // Redirect after delay
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error: any) {
      console.error('Failed to delete post', error);
      setDeleteError(error.response?.data?.message || 'Failed to delete post. Please try again.');
    }
  };

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

  const handleCommentUpdate = async (commentId: string) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      await axios.patch(
        `${apiUrl}/comments/${commentId}`,
        { content: editCommentContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingCommentId(null);
      fetchPost();
    } catch (error) {
      console.error('Failed to update comment', error);
    }
  };

  const handleCommentDelete = (commentId: string) => {
    setCommentToDeleteId(commentId);
    setDeleteError('');
    setShowCommentDeleteModal(true);
  };

  const confirmCommentDelete = async () => {
    if (!commentToDeleteId) return;
    setDeleteError('');
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      await axios.delete(
        `${apiUrl}/comments/${commentToDeleteId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowCommentDeleteModal(false);
      setCommentToDeleteId(null);
      fetchPost();
    } catch (error: any) {
      console.error('Failed to delete comment', error);
      setDeleteError(error.response?.data?.message || 'Failed to delete comment. Please try again.');
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
  const canEdit = user && post.author && user.id === post.author.id;
  const canDelete = user && (user.isAdmin || (post.author && user.id === post.author.id));
  const isEdited = new Date(post.updatedAt).getTime() - new Date(post.createdAt).getTime() > 60000; // 1 minute tolerance

  return (
    <div className="pt-24 max-w-4xl mx-auto space-y-8 px-4">
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Post"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/50"
              onClick={handleDelete}
            >
              Delete Post
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-red-500/10 text-red-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <p className="font-medium text-white">Are you sure you want to delete this post?</p>
            <p className="text-sm text-gray-400">
              This action cannot be undone. The post and all associated comments and reactions will be permanently removed.
            </p>
            {deleteError && (
              <p className="text-red-500 text-sm bg-red-500/10 p-2 rounded border border-red-500/20">
                {deleteError}
              </p>
            )}
          </div>
        </div>
      </Modal>

      {/* Comment Delete Confirmation Modal */}
      <Modal
        isOpen={showCommentDeleteModal}
        onClose={() => setShowCommentDeleteModal(false)}
        title="Delete Comment"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCommentDeleteModal(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/50"
              onClick={confirmCommentDelete}
            >
              Delete Comment
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-red-500/10 text-red-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <p className="font-medium text-white">Are you sure you want to delete this comment?</p>
            <p className="text-sm text-gray-400">
              This action cannot be undone.
            </p>
            {deleteError && (
              <p className="text-red-500 text-sm bg-red-500/10 p-2 rounded border border-red-500/20">
                {deleteError}
              </p>
            )}
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {}} // Prevent closing manually as we redirect
        title="Success"
      >
        <div className="flex flex-col items-center justify-center py-4 space-y-4 text-center">
          <div className="p-3 rounded-full bg-green-500/10 text-green-500">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <p className="text-lg font-medium text-white">{successMessage}</p>
          <p className="text-sm text-gray-400">Redirecting to home page...</p>
        </div>
      </Modal>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="space-y-6 border-neon-blue/30">
          <div className="space-y-4">
            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Title"
                  required
                  maxLength={100}
                />
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-space-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/50 transition-all duration-200 min-h-[200px] resize-none"
                  placeholder="Content"
                  required
                  maxLength={5000}
                />
                <div className="flex gap-2">
                  <Button type="submit">Save Changes</Button>
                  <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <h1 className="text-4xl font-bold text-white flex-1">{post.title}</h1>
                  <div className="flex gap-2 ml-4">
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="text-gray-400 hover:text-neon-blue"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDeleteModal(true)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-400 text-sm">
                  <span>Posted by @{post.author?.username || 'Unknown'}</span>
                  <span>•</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  {isEdited && (
                    <>
                      <span>•</span>
                      <span className="text-gray-500 italic">
                        Edited {new Date(post.updatedAt).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </div>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap break-words">
                    <RichText content={post.content} />
                  </p>
                </div>
              </>
            )}
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
                className="w-full bg-space-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/50 transition-all duration-200 min-h-[100px] resize-none"
                maxLength={1000}
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
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                    {user && (user.id === comment.author?.id || user.isAdmin) && (
                      <div className="flex gap-1 ml-2">
                        {user.id === comment.author?.id && (
                          <button
                            onClick={() => {
                              setEditingCommentId(comment.id);
                              setEditCommentContent(comment.content);
                            }}
                            className="text-gray-400 hover:text-neon-blue p-1"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => handleCommentDelete(comment.id)}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {editingCommentId === comment.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editCommentContent}
                      onChange={(e) => setEditCommentContent(e.target.value)}
                      className="w-full bg-space-900 border border-white/10 rounded p-2 text-white text-sm focus:outline-none focus:border-neon-blue/50 resize-none"
                      rows={3}
                      maxLength={1000}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => setEditingCommentId(null)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => handleCommentUpdate(comment.id)}>
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-300 break-words whitespace-pre-wrap">
                    <RichText content={comment.content} />
                  </p>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
