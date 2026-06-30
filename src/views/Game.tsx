'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { Game } from '../types';
import { ArrowLeft, Download, Info, CheckCircle, Image as ImageIcon, Heart, Star, Eye, Share2 } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { toast } from 'sonner';
import GameCard from '../components/GameCard';
import CommentBox from '../components/CommentBox';
import SimilarGames from '../components/SimilarGames';

export default function GamePage() {
  const params = useParams();
  const slug = params?.slug;
  const router = useRouter();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedGames, setRelatedGames] = useState<Game[]>([]);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchGame();
      checkWishlist();
    }
  }, [slug]);

  const checkWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('gameStudio_wishlist') || '[]');
    setInWishlist(wishlist.includes(slug));
  };

  const toggleWishlist = () => {
    let wishlist = JSON.parse(localStorage.getItem('gameStudio_wishlist') || '[]');
    if (wishlist.includes(slug)) {
      wishlist = wishlist.filter((s: string) => s !== slug);
      toast.success('Removed from Wishlist');
      setInWishlist(false);
    } else {
      wishlist.push(slug);
      toast.success('Added to Wishlist');
      setInWishlist(true);
    }
    localStorage.setItem('gameStudio_wishlist', JSON.stringify(wishlist));
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: game?.data.title,
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

  const fetchGame = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('slug', slug)
      .single();
      
    if (!error && data) {
      const newViews = (data.views || 0) + 1;
      await supabase.from('games').update({ views: newViews }).eq('slug', slug);
      data.views = newViews;

      setGame(data);
      fetchRelatedGames(data.data.category);
    }
    setLoading(false);
  };

  const handleDownloadClick = async () => {
    if (game) {
      const newDownloads = (game.downloads || 0) + 1;
      await supabase.from('games').update({ downloads: newDownloads }).eq('slug', slug);
      setGame({ ...game, downloads: newDownloads });
    }
  };

  const handleRating = async (rating: number) => {
    if (!game) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      toast.error('Must be logged in to rate');
      return;
    }
    
    // Check if rated
    const { data: existing } = await supabase
      .from('ratings')
      .select('*')
      .eq('game_id', game.id)
      .eq('user_id', session.user.id)
      .single();
      
    if (existing) {
      toast.error('You have already rated this game!');
      return;
    }
    
    // Insert
    const { error } = await supabase.from('ratings').insert({
      game_id: game.id,
      user_id: session.user.id,
      rating
    });
    
    if (error) {
      toast.error(error.message);
      return;
    }
    
    const newCount = (game.rating_count || 0) + 1;
    const currentTotal = (game.rating_avg || 0) * (game.rating_count || 0);
    const newAvg = (currentTotal + rating) / newCount;
    
    await supabase.from('games').update({ rating_avg: newAvg.toFixed(1), rating_count: newCount }).eq('id', game.id);
    
    setGame({ ...game, rating_avg: newAvg, rating_count: newCount });
    toast.success('Thank you for rating!');
  };

  const fetchRelatedGames = async (category: string) => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .neq('slug', slug)
      .contains('data', { category })
      .limit(3);
      
    if (!error && data) {
      setRelatedGames(data);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center px-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Game Not Found</h2>
        <button onClick={() => router.push('/')} className="glass px-6 py-2 rounded-full text-cyan-500 glow-hover">
          Back to Home
        </button>
      </div>
    );
  }

  const { data } = game;

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|shorts\/|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-500 pb-32">
      <button 
        onClick={() => router.push('/')}
        className="flex items-center space-x-2 text-cyan-500 mb-8 hover:text-cyan-400 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Home</span>
      </button>

      <div className="glass rounded-3xl overflow-hidden mb-12 bg-white/5 dark:bg-black/20">
        <div className="relative h-64 sm:h-80 md:h-96 w-full">
          <img 
            src={data.image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f'} 
            alt={data.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-cyan-500/50 backdrop-blur-md border border-cyan-400/30 mb-3 inline-block">
              {data.category}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white glow-text mb-4">{data.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="glass px-4 py-2 rounded-xl flex items-center space-x-2 text-sm font-bold text-cyan-500 bg-white/5 border border-white/10 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                <span>🔥 {game.views || 0} Views</span>
              </div>
              <div className="glass px-4 py-2 rounded-xl flex items-center space-x-2 text-sm font-bold text-cyan-500 bg-white/5 border border-white/10 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                <span>⬇️ {game.downloads || 0} Downloads</span>
              </div>
              <div className="glass px-4 py-2 rounded-xl flex items-center space-x-1 bg-white/5 border border-white/10 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`cursor-pointer transition-colors text-lg ${
                      star <= Math.round(game.rating_avg || 0)
                        ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]'
                        : 'text-gray-500 hover:text-yellow-300'
                    }`}
                    onClick={() => handleRating(star)}
                  >
                    ⭐
                  </span>
                ))}
                <span className="ml-2 text-sm font-bold text-cyan-500">
                  {game.rating_avg ? Number(game.rating_avg).toFixed(1) : '0.0'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <section>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {data.description}
            </p>
          </section>

          {(data.videos || data.videoUrl) && ((data.videos && data.videos.length > 0) || data.videoUrl) && (
            <section>
              <h2 className="text-2xl font-bold flex items-center space-x-2 mb-4 text-gray-900 dark:text-white">
                <span>Gameplay & Trailers</span>
              </h2>
              <div className="rounded-xl overflow-hidden glass border border-white/10">
                <Swiper
                  modules={[Navigation, Pagination]}
                  navigation
                  pagination={{ clickable: true }}
                  className="w-full aspect-video"
                >
                  {(data.videos || [data.videoUrl]).filter(Boolean).map((vid: string, idx: number) => {
                    const yid = extractYoutubeId(vid);
                    return (
                      <SwiperSlide key={idx}>
                        {yid ? (
                          <iframe
                            className="w-full h-full"
                            src={`https://www.youtube-nocookie.com/embed/${yid}?autoplay=1&mute=1`}
                            title={`Video ${idx + 1}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-black/50 text-gray-400">
                            Invalid Video URL
                          </div>
                        )}
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.specs && data.specs.length > 0 && (
              <section>
                <h2 className="text-xl font-bold flex items-center space-x-2 mb-4 text-gray-900 dark:text-white">
                  <Info className="text-cyan-500" />
                  <span>System Requirements</span>
                </h2>
                <div className="glass p-5 rounded-2xl bg-white/5 dark:bg-black/20 space-y-3 border border-white/10">
                  {data.specs.map((spec, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 dark:border-white/10 pb-2 last:border-0 last:pb-0">
                      <span className="font-semibold text-gray-600 dark:text-gray-400">{spec.label}</span>
                      <span className="text-gray-900 dark:text-white text-right">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(data.features || data.steps) && (data.features || data.steps).length > 0 && (
              <section>
                <h2 className="text-xl font-bold flex items-center space-x-2 mb-4 text-gray-900 dark:text-white">
                  <CheckCircle className="text-cyan-500" />
                  <span>Features / Installation Steps</span>
                </h2>
                <div className="glass p-5 rounded-2xl bg-white/5 dark:bg-black/20 space-y-4 border border-white/10">
                  {(data.features || data.steps).map((step: string, idx: number) => (
                    <div key={idx} className="flex space-x-3">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-500 flex items-center justify-center flex-shrink-0 text-sm font-bold border border-cyan-500/30">
                        {idx + 1}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {data.screenshots && data.screenshots.length > 0 && (
            <section>
              <h2 className="text-xl font-bold flex items-center space-x-2 mb-4 text-gray-900 dark:text-white">
                <ImageIcon className="text-cyan-500" />
                <span>Screenshots</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {data.screenshots.map((shot, idx) => (
                  <div key={idx} className="aspect-video rounded-xl overflow-hidden glass border border-white/10">
                    <img src={shot} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.downloads && data.downloads.length > 0 && (
            <section className="pt-6 border-t border-gray-200 dark:border-white/10">
              <h2 className="text-2xl font-bold flex items-center space-x-2 mb-6 text-gray-900 dark:text-white">
                <Download className="text-cyan-500" />
                <span>Downloads</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.downloads.map((dl, idx) => (
                  <a
                    key={idx}
                    href={dl.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleDownloadClick}
                    className="flex items-center justify-between p-4 rounded-xl glass glow-hover bg-white/5 dark:bg-black/30 group border border-white/10"
                    style={{ borderLeftColor: dl.color || '#06b6d4', borderLeftWidth: '4px' }}
                  >
                    <span className="font-bold text-gray-900 dark:text-white group-hover:text-cyan-400 transition-colors">
                      {dl.name}
                    </span>
                    <Download size={18} className="text-gray-500 group-hover:text-cyan-400 transition-colors" />
                  </a>
                ))}
              </div>
            </section>
          )}

          <div className="pt-8 flex flex-wrap justify-center gap-4">
            <button 
              onClick={toggleWishlist}
              className={`flex items-center space-x-2 px-8 py-4 rounded-xl font-bold transition-all glow-hover ${inWishlist ? 'bg-black/5 dark:bg-white/10 text-cyan-500 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.2)]' : 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 hover:bg-cyan-400'}`}
            >
              <Heart size={20} className={inWishlist ? 'fill-cyan-500' : ''} />
              <span>{inWishlist ? 'In Wishlist' : 'Add to Wishlist'}</span>
            </button>
            <button 
              onClick={handleShare}
              className="flex items-center space-x-2 px-8 py-4 rounded-xl font-bold transition-all glow-hover bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 hover:bg-cyan-400"
            >
              <Share2 size={20} />
              <span>Share</span>
            </button>
          </div>
          
          <div className="mt-12 border-t border-gray-200 dark:border-white/10 pt-8">
            <CommentBox gameId={game.id} gameSlug={game.slug} />
          </div>
        </div>
      </div>

      <section className="mt-16 animate-in fade-in">
        <SimilarGames genre={data.category} currentGameId={game.id} />
      </section>
    </div>
  );
}
