'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      await axios.post(`${apiUrl}/auth/register`, {
        email,
        password,
        username,
      });
      router.push('/login');
    } catch (error) {
      console.error('Registration failed', error);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md p-8 space-y-8 border-neon-purple/20">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Join the Future</h1>
          <p className="text-gray-400">Create your identity in the digital realm</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="CyberPunk2077"
            required
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
          />
          
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button type="submit" className="w-full bg-gradient-to-r from-neon-pink to-neon-purple" size="lg">
            Register
          </Button>
        </form>

        <div className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-neon-purple hover:text-neon-pink transition-colors">
            Login here
          </Link>
        </div>
      </Card>
    </div>
  );
}
