'use client';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GameCard from '../components/GameCard';
import { Game } from '../types';
import { supabase } from '../lib/supabase';

export default function Wishlist() {
  const { t } = useTranslation();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    const wishlist = JSON.parse(localStorage.getItem('gameStudio_wishlist') || '[]');
    
    if (wishlist.length === 0) {
      setGames([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('games')
      .select('*')
      .in('slug', wishlist)
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setGames(data);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="text-center pt-8 md:pt-12">
        <h1 className="text-4xl md:text-6xl font-black tracking-widest glow-text mb-4">
          My Wishlist
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto px-4">
          {t('Your saved games for later.')}
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 pb-20">
          {games.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {games.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <p className="text-lg">{t('Your wishlist is empty.')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
