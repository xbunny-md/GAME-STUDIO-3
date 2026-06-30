'use client';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import GameCard from '../components/GameCard';
import { Game } from '../types';
import { supabase } from '../lib/supabase';

interface HomeProps {
  currentCategory?: string;
}

const SkeletonGameCard = () => (
  <div className="glass rounded-2xl overflow-hidden h-full flex flex-col bg-white/5 dark:bg-black/20 border-white/10 animate-pulse min-h-[300px]">
    <div className="relative aspect-video bg-gray-700/30"></div>
    <div className="p-5 flex-1 flex flex-col space-y-3">
      <div className="h-6 bg-gray-700/30 rounded w-3/4"></div>
      <div className="h-4 bg-gray-700/30 rounded w-full"></div>
      <div className="h-4 bg-gray-700/30 rounded w-5/6"></div>
    </div>
  </div>
);

export default function Home({ currentCategory }: HomeProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
  }, []);

  const seedDatabase = async () => {
    const dummyGames = [
      {
        slug: 'gta-sa-mobile',
        data: {
          title: "GTA San Andreas Mobile",
          category: "Android",
          image: "https://images.pexels.com/photos/163036/mario-luigi-yoshi-super-mario-163036.jpeg",
          videos: ["https://youtube.com/shorts/zSSrQvpY9ow?si=uDfgHr86QImWE5r-"],
          description: "Experience the classic open-world action on your mobile device.",
          steps: ["Download APK", "Install", "Play"],
          screenshots: ["https://images.pexels.com/photos/163036/mario-luigi-yoshi-super-mario-163036.jpeg"],
          specs: [{ label: "OS", value: "Android 7.0+" }],
          downloads: [{ name: "Download APK", url: "1dm://example.com/gta", color: "#06b6d4", icon: "download" }]
        }
      },
      {
        slug: 'god-of-war-3-rpcs3',
        data: {
          title: "God of War 3 RPCS3",
          category: "PlayStation",
          image: "https://images.pexels.com/photos/275033/pexels-photo-275033.jpeg",
          videos: ["https://www.youtube.com/watch?v=12345678901"],
          description: "Kratos seeks revenge on Olympus.",
          steps: ["Download ROM", "Load in RPCS3", "Play"],
          screenshots: ["https://images.pexels.com/photos/275033/pexels-photo-275033.jpeg"],
          specs: [{ label: "OS", value: "Windows 10" }],
          downloads: [{ name: "Download ROM", url: "1dm://example.com/gow3", color: "#06b6d4", icon: "download" }]
        }
      },
      {
        slug: 'elden-ring-pc-repack',
        data: {
          title: "Elden Ring PC Repack",
          category: "PC",
          image: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg",
          videos: ["https://www.youtube.com/watch?v=12345678901"],
          description: "Rise, Tarnished.",
          steps: ["Extract", "Run setup.exe", "Play"],
          screenshots: ["https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg"],
          specs: [{ label: "OS", value: "Windows 10" }],
          downloads: [{ name: "Download Repack", url: "1dm://example.com/er", color: "#06b6d4", icon: "download" }]
        }
      },
      {
        slug: 'ppsspp-tekken-6',
        data: {
          title: "PPSSPP Tekken 6",
          category: "PPSSPP",
          image: "https://images.pexels.com/photos/1298684/pexels-photo-1298684.jpeg",
          videos: ["https://www.youtube.com/watch?v=12345678901"],
          description: "The King of Iron Fist Tournament 6.",
          steps: ["Download ISO", "Load in PPSSPP", "Play"],
          screenshots: ["https://images.pexels.com/photos/1298684/pexels-photo-1298684.jpeg"],
          specs: [{ label: "OS", value: "Any" }],
          downloads: [{ name: "Download ISO", url: "1dm://example.com/tekken6", color: "#06b6d4", icon: "download" }]
        }
      }
    ];

    for (const game of dummyGames) {
      await fetch('/api/admin/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(game)
      });
    }
    
    fetchGames(true);
  };

  const fetchGames = async (isRetry = false) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      if (data.length === 0 && !isRetry) {
        await seedDatabase();
      } else {
        setGames(data);
      }
    }
    setLoading(false);
  };

  const filteredGames = games.filter(g => {
    const matchesSearch = g.data.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !currentCategory || currentCategory === 'All' || g.data.category === currentCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="text-center pt-8 md:pt-12">
        <h1 className="text-4xl md:text-6xl font-black tracking-widest glow-text mb-4">
          GAME STUDIO
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto px-4">
          {t('A hub for PC, Android, PlayStation, PPSSPP, iOS game repacks.')}
        </p>
      </header>

      <div className="max-w-2xl mx-auto px-4">
        <div className="relative">
          <input
            type="text"
            placeholder={t('Search games...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-dark dark:bg-black/30 bg-white/50 text-gray-900 dark:text-white rounded-full py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder-gray-500"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 pb-20">
          {[...Array(8)].map((_, i) => <SkeletonGameCard key={i} />)}
        </div>
      ) : (
        <div className="px-4 pb-20 space-y-12">
          {(!currentCategory || currentCategory === 'All') && filteredGames.some(g => g.data.isHot) && !search && (
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-2xl">🔥</span>
                <h2 className="text-2xl font-black text-white glow-text">Hot Games</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredGames.filter(g => g.data.isHot).map(game => (
                  <GameCard key={`hot-${game.id}`} game={game} />
                ))}
              </div>
            </div>
          )}

          <div>
            {(!currentCategory || currentCategory === 'All') && !search && (
              <h2 className="text-2xl font-black text-white glow-text mb-6">All Games</h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGames.length > 0 ? (
                filteredGames.map(game => (
                  <GameCard key={game.id} game={game} />
                ))
              ) : (
                <div className="col-span-full text-center py-20 text-gray-500">
                  <p className="text-lg">{t('No games found matching your criteria.')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
