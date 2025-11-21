'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User, Calendar, Edit, MessageSquare, TrendingUp, Award, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  commentsCount?: number;
  reactionsCount?: number;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
  reputation: number;
  posts: Post[];
}

export default function ProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await axios.get(`${apiUrl}/users/${username}`);
        setProfile(response.data);

        // Fetch follow stats
        const followersRes = await axios.get(`${apiUrl}/follows/${response.data.id}/followers`);
        const followingRes = await axios.get(`${apiUrl}/follows/${response.data.id}/following`);
        setFollowersCount(followersRes.data.length);
        setFollowingCount(followingRes.data.length);

        if (currentUser && currentUser.username !== username) {
          const token = localStorage.getItem('token');
          if (token) {
            const checkRes = await axios.get(`${apiUrl}/follows/${response.data.id}/check`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setIsFollowing(checkRes.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
      }
    };
    if (username) fetchProfile();
  }, [username, currentUser]);

  const handleFollow = async () => {
    if (!currentUser || !profile) return;
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      
      if (isFollowing) {
        await axios.delete(`${apiUrl}/follows/${profile.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFollowersCount(prev => prev - 1);
      } else {
        await axios.post(`${apiUrl}/follows/${profile.id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFollowersCount(prev => prev + 1);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Failed to toggle follow', error);
    }
  };

  if (!profile) return <div className="pt-24 text-center text-white">Loading...</div>;

  const isOwnProfile = currentUser?.username === profile.username;

  return (
    <div className="pt-24 max-w-4xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-neon-blue/30 p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-neon-blue/50 shadow-[0_0_20px_rgba(0,243,255,0.3)]">
              {profile.avatarUrl ? (
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${profile.avatarUrl}`} 
                  alt={profile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-space-800 flex items-center justify-center">
                  <User className="w-16 h-16 text-neon-blue" />
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <h1 className="text-4xl font-bold text-white">@{profile.username}</h1>
                <div className="flex gap-2">
                  {isOwnProfile ? (
                    <Link href="/profile/edit">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Edit className="w-4 h-4" />
                        Edit Profile
                      </Button>
                    </Link>
                  ) : currentUser && (
                    <Button 
                      variant={isFollowing ? "outline" : "primary"} 
                      size="sm" 
                      onClick={handleFollow}
                      className={isFollowing ? "border-red-500/50 text-red-500 hover:bg-red-500/10" : ""}
                    >
                      {isFollowing ? 'Unfollow' : 'Follow'}
                    </Button>
                  )}
                </div>
              </div>
              
              <p className="text-gray-300 text-lg max-w-2xl">
                {profile.bio || "No bio yet."}
              </p>
              
              <div className="flex items-center justify-center md:justify-start gap-6 text-gray-400 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="text-white font-bold">{followersCount}</span> Followers
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">{followingCount}</span> Following
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                <div className="px-3 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/30 text-neon-purple text-sm font-medium flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>Reputation: {profile.reputation || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="w-2 h-8 bg-neon-purple rounded-full" />
            User's Discussions ({profile.posts?.length || 0})
          </h2>

          <div className="grid gap-4">
            {profile.posts && profile.posts.length > 0 ? (
              profile.posts.map((post) => (
                <Link href={`/posts/${post.id}`} key={post.id}>
                  <Card hover className="group cursor-pointer h-full">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 w-full">
                        <h3 className="text-xl font-semibold text-white group-hover:text-neon-blue transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-gray-400 line-clamp-2">
                          {post.content}
                        </p>
                        <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4">
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              {post.commentsCount || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              {post.reactionsCount || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))
            ) : (
              <Card className="text-center py-12">
                <p className="text-gray-400">No discussions started yet.</p>
              </Card>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
