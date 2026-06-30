'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import GameCard from './GameCard';

interface SimilarGamesProps {
  genre: string;
  currentGameId: string;
}

export default function SimilarGames({ genre, currentGameId }: SimilarGamesProps) {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilar = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('games')
        .select('*')
        .eq('genre', genre)
        .neq('id', currentGameId)
        .limit(4);
      
      if (data) setGames(data);
      setLoading(false);
    };

    if (genre) fetchSimilar();
  }, [genre, currentGameId]);

  if (loading) return null;
  if (games.length === 0) return null;

  return (
    <div className="mt-16 pt-10 border-t border-white/10">
      <h2 className="text-2xl font-black text-white glow-text mb-6">You Might Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {games.map(game => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
