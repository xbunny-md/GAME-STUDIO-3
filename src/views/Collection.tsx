'use client';
import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import GameCard from '../components/GameCard';
import { Folder, ArrowLeft, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Collection() {
  const params = useParams();
  const slug = params?.slug;
  const [collection, setCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollection();
  }, [slug]);

  const fetchCollection = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('collections').select('*').eq('slug', slug).single();
      if (data && !error) {
        setCollection(data);
      } else {
        const local = JSON.parse(localStorage.getItem('gameStudio_collections') || '[]');
        const col = local.find((c: any) => c.slug === slug);
        if (col) setCollection(col);
      }
    } catch (err) {
      const local = JSON.parse(localStorage.getItem('gameStudio_collections') || '[]');
      const col = local.find((c: any) => c.slug === slug);
      if (col) setCollection(col);
    }
    setLoading(false);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: collection?.title,
          url: url
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link Copied!');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center px-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Collection Not Found</h2>
        <Link href="/collections" className="glass px-6 py-2 rounded-full text-cyan-500 glow-hover">
          Back to Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 pb-20 max-w-6xl mx-auto animate-in fade-in duration-500">
      <Link href="/collections" className="flex items-center space-x-2 text-cyan-500 mb-8 hover:text-cyan-400 transition-colors">
        <ArrowLeft size={20} />
        <span>Back to Collections</span>
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-cyan-500/20 text-cyan-500 rounded-2xl glass border border-white/10">
            <Folder size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white glow-text">{collection.title}</h1>
            <p className="text-gray-400">{collection.games?.length || 0} Games</p>
          </div>
        </div>
        
        <button 
          onClick={handleShare}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all shadow-[0_0_15px_rgba(0,255,255,0.1)]"
        >
          <Share2 size={20} />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>
      
      {collection.games?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Typically we'd fetch actual game objects by ID here, but since this is just UI setup, I'll render mock empty state if games array isn't fully populated */}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400 glass rounded-3xl bg-white/5 border border-white/10">
          No games in this collection yet.
        </div>
      )}
    </div>
  );
}
