'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { MessageSquare, TrendingUp, Users, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import useSWRInfinite from 'swr/infinite';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: {
    username: string;
    avatarUrl?: string;
  };
  comments: any[];
  reactions: any[];
  commentsCount?: number;
  reactionsCount?: number;
}

interface PostResponse {
  data: Post[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function Home() {
  const { isAuthenticated } = useAuth();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const getKey = (pageIndex: number, previousPageData: PostResponse | null) => {
    if (previousPageData && !previousPageData.data.length) return null; // reached the end
    return `${apiUrl}/posts?page=${pageIndex + 1}&limit=10`;
  };

  const [visitedPosts, setVisitedPosts] = useState<string[]>([]);

  useEffect(() => {
    const visited = JSON.parse(localStorage.getItem('visitedPosts') || '[]');
    setVisitedPosts(visited);
  }, []);

  const { data, error, size, setSize, isLoading } = useSWRInfinite<PostResponse>(getKey, fetcher, {
    revalidateFirstPage: true,
    revalidateOnMount: true,
  });

  const posts = data ? data.flatMap(page => page.data) : [];
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.data.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.data.length < 10);

  // Debug log
  useEffect(() => {
    console.log('Home Page State:', { isLoading, error, postsLength: posts.length, data });
  }, [isLoading, error, posts, data]);

  return (
    <div className="space-y-12 pt-20">
      {/* Hero Section */}
      <section className="relative py-20 text-center">
        <div className="absolute inset-0 bg-hero-glow opacity-50 pointer-events-none" />
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 space-y-6"
        >
          <h1 className="text-6xl font-bold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink">
              The Future of
            </span>
            <br />
            <span className="text-white text-glow">Discussion</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Join the next generation community platform. Share ideas, connect with peers, and explore the unknown.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link href={isAuthenticated ? "/create-post" : "/login"}>
              <Button size="lg" className="shadow-neon-blue/20 shadow-lg">
                Start Discussion
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Recent Discussions */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <span className="w-2 h-8 bg-neon-purple rounded-full" />
            Recent Discussions
          </h2>
          {isAuthenticated && (
            <Link href="/create-post">
              <Button>New Post</Button>
            </Link>
          )}
        </div>
        
        <div className="grid gap-4">
          {error ? (
             <Card className="text-center py-12 border-red-500/50">
               <p className="text-red-400">Failed to load discussions. Please try again later.</p>
             </Card>
          ) : isLoading && posts.length === 0 ? (
             <Card className="text-center py-12">
               <div className="flex justify-center items-center gap-2 text-gray-400">
                 <Loader2 className="w-6 h-6 animate-spin" />
                 <p>Loading discussions...</p>
               </div>
             </Card>
          ) : posts.length === 0 ? (
             <Card className="text-center py-12">
               <p className="text-gray-400">No discussions yet. Be the first to start one!</p>
             </Card>
          ) : (
            <>
              {posts.map((post) => (
                <Link href={`/posts/${post.id}`} key={post.id}>
                  <Card hover className="group cursor-pointer h-full">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 w-full">
                        <h3 className={`text-xl font-semibold transition-colors ${visitedPosts.includes(post.id) ? 'text-gray-500' : 'text-white group-hover:text-neon-blue'}`}>
                          {post.title}
                        </h3>
                        <p className="text-gray-400 line-clamp-2">
                          {post.content}
                        </p>
                        <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4">
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <div className="flex items-center gap-2 hover:text-neon-blue transition-colors" onClick={(e) => {
                              e.preventDefault();
                              window.location.href = `/profile/${post.author?.username}`;
                            }}>
                              {post.author?.avatarUrl ? (
                                <div className="relative w-6 h-6 rounded-full overflow-hidden">
                                  <Image 
                                    src={`http://localhost:4000${post.author.avatarUrl}`} 
                                    alt={post.author.username}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-space-700 flex items-center justify-center">
                                  <span className="text-xs text-white">{post.author?.username?.[0]?.toUpperCase() || '?'}</span>
                                </div>
                              )}
                              <span>@{post.author?.username || 'Unknown'}</span>
                            </div>
                            <span>•</span>
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              {post.commentsCount || post.comments?.length || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              {post.reactionsCount || post.reactions?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
              
              {!isReachingEnd && (
                <div className="flex justify-center pt-4">
                  <Button 
                    variant="secondary" 
                    onClick={() => setSize(size + 1)}
                    disabled={isLoadingMore}
                    className="gap-2"
                  >
                    {isLoadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isLoadingMore ? 'Loading more...' : 'Load More'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
