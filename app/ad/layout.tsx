'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../src/lib/supabase';
import { toast } from 'sonner';
import AdminSidebar from '../../src/components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = sessionStorage.getItem('adminAuth');
    if (checkSession === 'true') {
      setIsAuthenticated(true);
      setChecking(false);
    } else {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user?.email && ['qbotmanager@gmail.com', 'lupinstarnley009@gmail.com'].includes(session.user.email)) {
          setIsAuthenticated(true);
          sessionStorage.setItem('adminAuth', 'true');
        } else if (session?.user) {
          const { data } = await supabase.from('profiles').select('is_admin').eq('id', session.user.id).single();
          if (data?.is_admin) {
            setIsAuthenticated(true);
            sessionStorage.setItem('adminAuth', 'true');
          }
        }
        setChecking(false);
      });
    }
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (['qbotmanager@gmail.com', 'lupinstarnley009@gmail.com'].includes(adminEmail) && adminPassword === '2892') {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
      toast.success('Admin Access Granted', { className: 'glass bg-cyan-500/20 text-cyan-500 border-cyan-500/20' });
    } else {
      toast.error('Invalid Admin Credentials', { className: 'glass bg-red-500/20 text-red-500 border-red-500/20' });
      router.push('/');
    }
  };

  if (checking) {
    return <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center text-cyan-500">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-4">
        <div className="glass p-8 rounded-3xl w-full max-w-md bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10 animate-in fade-in zoom-in shadow-xl">
          <h2 className="text-2xl font-black text-cyan-500 mb-6 text-center glow-text">Admin Login</h2>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Email</label>
              <input type="email" required value={adminEmail} onChange={e=>setAdminEmail(e.target.value)} className="w-full mt-1 glass-dark rounded-xl px-4 py-3 outline-none focus:border-cyan-500 text-gray-900 dark:text-white border border-black/10 dark:border-white/10" placeholder="admin@example.com" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Password</label>
              <input type="password" required value={adminPassword} onChange={e=>setAdminPassword(e.target.value)} className="w-full mt-1 glass-dark rounded-xl px-4 py-3 outline-none focus:border-cyan-500 text-gray-900 dark:text-white border border-black/10 dark:border-white/10" placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full py-4 mt-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold transition-all shadow-[0_0_15px_rgba(0,255,255,0.3)] glow-hover">
              Authenticate
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      <AdminSidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
          {children}
        </div>
      </div>
    </div>
  );
}
