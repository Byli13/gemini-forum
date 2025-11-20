'use client';

import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await axios.post(`${apiUrl}/auth/login`, {
        email,
        password,
      });
      login(response.data.access_token);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md p-8 space-y-8 border-neon-blue/20">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-gray-400">Enter your credentials to access the matrix</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <Button type="submit" className="w-full" size="lg">
            Login
          </Button>
        </form>

        <div className="text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link href="/register" className="text-neon-blue hover:text-neon-purple transition-colors">
            Register now
          </Link>
        </div>
      </Card>
    </div>
  );
}
