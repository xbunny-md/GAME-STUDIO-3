'use client';
export const dynamic = 'force-dynamic';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../src/lib/supabase';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalGames: 0, totalViews: 0, popular: '', totalUsers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data: gData } = await supabase.from('games').select('*');
    const { count: uCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    
    let totalGames = 0;
    let totalViews = 0;
    let popular = '';

    if (gData) {
      totalGames = gData.length;
      totalViews = gData.reduce((acc, g) => acc + (g.views || 0), 0);
      if (gData.length > 0) {
        const sorted = [...gData].sort((a, b) => (b.views || 0) - (a.views || 0));
        popular = sorted[0].data?.title || '';
      }
    }
    setStats({ totalGames, totalViews, popular, totalUsers: uCount || 0 });
    setLoading(false);
  };

  if (loading) return <div className="text-cyan-500 font-bold">Loading dashboard...</div>;

  return (
    <div>
      <h1 className="text-3xl font-black glow-text mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass p-6 rounded-3xl bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10 glow-hover">
          <h3 className="text-gray-600 dark:text-gray-400 font-bold mb-2">Total Games</h3>
          <p className="text-3xl font-black text-cyan-600 dark:text-cyan-500 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">{stats.totalGames}</p>
        </div>
        <div className="glass p-6 rounded-3xl bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10 glow-hover">
          <h3 className="text-gray-600 dark:text-gray-400 font-bold mb-2">Total Views</h3>
          <p className="text-3xl font-black text-cyan-600 dark:text-cyan-500 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">{stats.totalViews}</p>
        </div>
        <div className="glass p-6 rounded-3xl bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10 glow-hover">
          <h3 className="text-gray-600 dark:text-gray-400 font-bold mb-2">Total Users</h3>
          <p className="text-3xl font-black text-cyan-600 dark:text-cyan-500 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">{stats.totalUsers}</p>
        </div>
        <div className="glass p-6 rounded-3xl bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10 glow-hover">
          <h3 className="text-gray-600 dark:text-gray-400 font-bold mb-2">Most Popular Game</h3>
          <p className="text-xl font-black text-cyan-600 dark:text-cyan-500 truncate drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]" title={stats.popular}>{stats.popular || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}
