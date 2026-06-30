'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import { Download, Star, Trophy } from 'lucide-react';

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<'downloads' | 'ratings'>('downloads');
  const [topDownloads, setTopDownloads] = useState<any[]>([]);
  const [topRated, setTopRated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    
    // Fetch top downloaded
    const { data: downloads } = await supabase
      .from('games')
      .select('*')
      .order('download_count', { ascending: false })
      .limit(10);
      
    setTopDownloads(downloads || []);

    // Fetch top rated (calculating average rating)
    const { data: games } = await supabase.from('games').select('id, title, cover_url, genre');
    const { data: ratings } = await supabase.from('ratings').select('*');
    
    if (games && ratings) {
      const ratedGames = games.map(game => {
        const gameRatings = ratings.filter(r => r.game_id === game.id);
        const avgRating = gameRatings.length > 0 
          ? gameRatings.reduce((acc, r) => acc + r.rating, 0) / gameRatings.length 
          : 0;
        return { ...game, avgRating, totalRatings: gameRatings.length };
      }).sort((a, b) => b.avgRating - a.avgRating).slice(0, 10);
      
      setTopRated(ratedGames);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-20 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center space-x-4 mb-8">
        <div className="p-3 bg-cyan-500/20 text-cyan-500 rounded-2xl glass border border-white/10">
          <Trophy size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-cyan-500 glow-text">Leaderboard</h1>
          <p className="text-gray-400">Top games this week</p>
        </div>
      </div>

      <div className="flex space-x-2 mb-8 p-1 glass bg-white/5 border border-white/10 rounded-2xl w-full max-w-md backdrop-blur-xl">
        <button
          onClick={() => setActiveTab('downloads')}
          className={`flex-1 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'downloads' ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(0,255,255,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          Top 10 Downloaded
        </button>
        <button
          onClick={() => setActiveTab('ratings')}
          className={`flex-1 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'ratings' ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(0,255,255,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          Top 10 Rated
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {(activeTab === 'downloads' ? topDownloads : topRated).map((game, index) => (
            <Link 
              key={game.id} 
              href={`/game/${game.id}`}
              className="glass p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-xl flex items-center space-x-6 group"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl flex-shrink-0 ${index < 3 ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(0,255,255,0.4)]' : 'glass-dark bg-white/5 text-gray-400 border border-white/10'}`}>
                {index + 1}
              </div>
              
              <img src={game.cover_url} alt={game.title} className="w-16 h-16 rounded-xl object-cover" />
              
              <div className="flex-1">
                <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors">{game.title}</h3>
                <p className="text-sm text-gray-400">{game.genre}</p>
              </div>
              
              <div className="text-right">
                {activeTab === 'downloads' ? (
                  <div className="flex items-center space-x-2 text-cyan-400 font-bold bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                    <Download size={16} />
                    <span>{game.download_count || 0}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-yellow-400 font-bold bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                    <Star size={16} fill="currentColor" />
                    <span>{game.avgRating?.toFixed(1) || '0.0'}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
          
          {(activeTab === 'downloads' ? topDownloads : topRated).length === 0 && (
            <div className="text-center py-20 text-gray-400 glass rounded-3xl bg-white/5 border border-white/10">
              No games found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
