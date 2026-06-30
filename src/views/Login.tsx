'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notify, setNotify] = useState(true);
  const [loading, setLoading] = useState(false);
  const [maintenance, setMaintenance] = useState(false);
  const router = useRouter();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // First try to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          // Try to sign up if sign in fails with invalid credentials
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
          });

          if (signUpError) {
            toast.error(signUpError.message);
            setLoading(false);
            return;
          } else {
            toast.success('Check your email for the confirmation link!');
            if (signUpData.user) {
              const isAdmin = email === 'lupinstarnley009@gmail.com' && password === '2892';
              await supabase.from('profiles').upsert({
                id: signUpData.user.id,
                email: signUpData.user.email,
                notify_new_games: notify,
                ...(isAdmin ? { is_admin: true } : {})
              });
            }
          }
        } else {
          toast.error(signInError.message);
          setLoading(false);
          return;
        }
      } else {
        toast.success('Logged in successfully!');
        if (signInData.user) {
          const isAdmin = email === 'lupinstarnley009@gmail.com' && password === '2892';
          await supabase.from('profiles').upsert({
            id: signInData.user.id,
            email: signInData.user.email,
            notify_new_games: notify,
            ...(isAdmin ? { is_admin: true } : {})
          });
        }
        router.push('/');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) {
        if (error.status === 404 || error.message?.includes('not enabled') || error.message?.includes('Unsupported provider') || error.message?.includes('validation_failed') || error.message?.includes('FetchError') || error.message?.includes('Failed to fetch')) {
          toast.error("OAuth Provider not properly configured. " + error.message);
          return;
        }
        toast.error(error.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    }
  };

  if (maintenance) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass p-8 md:p-12 rounded-3xl bg-white/5 dark:bg-black/20 border border-white/10 backdrop-blur-xl w-full max-w-md text-center shadow-[0_0_50px_rgba(0,255,255,0.1)]">
          <div className="text-6xl mb-6">🛠️</div>
          <h1 className="text-2xl font-black text-white glow-text mb-4">Service Under Maintenance</h1>
          <p className="text-gray-400">The service is now under maintenance so await. We are upgrading.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass p-8 md:p-12 rounded-3xl bg-white/5 dark:bg-black/20 border border-white/10 w-full max-w-md animate-in fade-in zoom-in duration-500 shadow-[0_0_50px_rgba(0,255,255,0.1)]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-widest text-cyan-500 glow-text mb-2">GAME STUDIO</h1>
          <p className="text-gray-500 dark:text-gray-400">Welcome back, gamer</p>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center space-x-3 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-bold mb-6 text-gray-900 dark:text-white glow-hover"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            <path d="M1 1h22v22H1z" fill="none"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-white/10"></div>
          <span className="px-4 text-sm text-gray-500">OR</span>
          <div className="flex-1 border-t border-white/10"></div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Email address</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full glass-dark rounded-xl px-4 py-3 outline-none focus:border-cyan-500 text-gray-900 dark:text-white border border-white/10 transition-colors"
              placeholder="gamer@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full glass-dark rounded-xl px-4 py-3 outline-none focus:border-cyan-500 text-gray-900 dark:text-white border border-white/10 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <label className="flex items-center space-x-3 cursor-pointer group">
            <div className="relative">
              <input 
                type="checkbox" 
                checked={notify}
                onChange={(e) => setNotify(e.target.checked)}
                className="sr-only" 
              />
              <div className={`w-10 h-6 rounded-full transition-colors ${notify ? 'bg-cyan-500 shadow-[0_0_10px_rgba(0,255,255,0.4)]' : 'bg-white/10'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${notify ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </div>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-cyan-500 transition-colors">
              🔔 Notify me of new games
            </span>
          </label>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold transition-all shadow-[0_0_15px_rgba(0,255,255,0.3)] glow-hover disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Login / Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}
