'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User, Calendar, Edit } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await axios.get(`${apiUrl}/users/${username}`);
        setProfile(response.data);
      } catch (error) {
        console.error('Failed to fetch profile', error);
      }
    };
    if (username) fetchProfile();
  }, [username]);

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
                  src={`http://localhost:4000${profile.avatarUrl}`} 
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
                {isOwnProfile && (
                  <Link href="/profile/edit">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </Button>
                  </Link>
                )}
              </div>
              
              <p className="text-gray-300 text-lg max-w-2xl">
                {profile.bio || "No bio yet."}
              </p>
              
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400 text-sm">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
