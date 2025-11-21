'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { Upload, Save } from 'lucide-react';

export default function EditProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    // Fetch current profile data
    const fetchProfile = async () => {
      if (user?.username) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
          const res = await axios.get(`${apiUrl}/users/${user.username}`);
          setBio(res.data.bio || '');
          if (res.data.avatarUrl) {
            setPreviewUrl(`${apiUrl}${res.data.avatarUrl}`);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    fetchProfile();
  }, [isAuthenticated, user, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      
      const formData = new FormData();
      formData.append('bio', bio);
      if (avatar) {
        formData.append('avatar', avatar);
      }

      await axios.patch(`${apiUrl}/users/profile`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      router.push(`/profile/${user?.username}`);
    } catch (error) {
      console.error('Failed to update profile', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 max-w-2xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-neon-blue/30 p-8 space-y-6">
          <h1 className="text-3xl font-bold text-white mb-8">Edit Profile</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-gray-300 text-sm font-medium">Profile Picture</label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-neon-blue/30 bg-space-800">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      No Img
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label htmlFor="avatar-upload">
                    <div className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-space-700 text-white hover:bg-space-600 transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>Choose Image</span>
                    </div>
                  </label>
                  <p className="mt-2 text-xs text-gray-500">Max size 2MB. JPG, PNG, WebP.</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-gray-300 text-sm font-medium">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-space-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/50 min-h-[120px] resize-none"
                placeholder="Tell us about yourself..."
                maxLength={500}
              />
            </div>

            <div className="pt-4 flex justify-end gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
