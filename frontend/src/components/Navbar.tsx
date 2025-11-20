'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/Button';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10"
    >
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Sparkles className="w-6 h-6 text-neon-blue group-hover:animate-spin-slow" />
            <div className="absolute inset-0 bg-neon-blue blur-lg opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-neon-blue transition-all">
            Gemini Forum
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Button variant="ghost" onClick={logout}>
              Logout
            </Button>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
