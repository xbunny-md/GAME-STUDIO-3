'use client';
import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import GameCard from '../components/GameCard';
import AchievementBadge from '../components/AchievementBadge';
import { Heart, Star, MessageSquare, Trash2, Edit2, Shield, UserPlus, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const params = useParams();
  const username = params?.username;
  const [activeTab, setActiveTab] = useState('wishlist');
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [rated, setRated] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [followers, setFollowers] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [hasVerifiedBadge, setHasVerifiedBadge] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user || null);
    });
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [username, currentUser]);

  const fetchUserData = async () => {
    setLoading(true);
    
    // Find user by email prefix (username)
    let pUserId = null;
    let isVer = false;
    const { data: profiles } = await supabase.from('profiles').select('id, email, is_verified').ilike('email', `${username}@%`).limit(1);
    if (profiles && profiles.length > 0) {
      pUserId = profiles[0].id;
      isVer = !!profiles[0].is_verified;
      if (['qbotmanager@gmail.com', 'lupinstarnley009@gmail.com'].includes(profiles[0].email)) {
        isVer = true;
      }
      setProfileUserId(pUserId);
      setHasVerifiedBadge(isVer);
      
      // Fetch badges
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*, badge_types(*)')
        .eq('user_id', pUserId);
      if (achievements) setBadges(achievements);
      
      // Fetch followers
      const { data: followData } = await supabase
        .from('follows')
        .select('*', { count: 'exact' })
        .eq('following_id', pUserId);
      if (followData) setFollowers(followData.length);
      
      // Check if following
      if (currentUser) {
        const { data: isF } = await supabase
          .from('follows')
          .select('*')
          .eq('follower_id', currentUser.id)
          .eq('following_id', pUserId)
          .single();
        setIsFollowing(!!isF);
      }

      // Auto-verify system
      if (!isVer && (achievements?.length || 0) >= 1) {
        await supabase.from('profiles').update({ is_verified: true }).eq('id', pUserId);
        setHasVerifiedBadge(true);
      }
    }

    // 1. Fetch Wishlist
    const localWishlist = JSON.parse(localStorage.getItem('gameStudio_wishlist') || '[]');
    setWishlist(localWishlist);

    // 2. Fetch Rated
    const localRatings = JSON.parse(localStorage.getItem('gameStudio_ratings') || '{}');
    const ratedIds = Object.keys(localRatings);
    if (ratedIds.length > 0) {
      const { data: ratedGames } = await supabase.from('games').select('*').in('id', ratedIds);
      if (ratedGames) {
        setRated(ratedGames.map(g => ({ ...g, userRating: localRatings[g.id] })));
      }
    }

    // 3. Fetch Comments
    const { data: userComments } = await supabase
      .from('comments')
      .select('*, games(slug, data)')
      .ilike('user_email', `${username}@%`)
      .order('created_at', { ascending: false });
    
    if (userComments) {
      setComments(userComments);
    }

    setLoading(false);
  };

  const handleFollow = async () => {
    if (!currentUser || !profileUserId) {
      toast.error('Must be logged in');
      return;
    }
    
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', currentUser.id).eq('following_id', profileUserId);
      setIsFollowing(false);
      setFollowers(prev => prev - 1);
    } else {
      await supabase.from('follows').insert({ follower_id: currentUser.id, following_id: profileUserId });
      setIsFollowing(true);
      setFollowers(prev => prev + 1);
      toast.success(`Followed ${username}`, { className: 'glass bg-cyan-500/10 text-cyan-500 border-cyan-500/20' });
    }
  };

  const removeFromWishlist = (gameId: string) => {
    const updated = wishlist.filter(g => g.id !== gameId);
    setWishlist(updated);
    localStorage.setItem('gameStudio_wishlist', JSON.stringify(updated));
    toast.success('Removed from wishlist', { className: 'glass bg-white/10 text-white border-white/10' });
  };

  const tabs = [
    { id: 'wishlist', label: 'Wishlist', icon: <Heart size={18} /> },
    { id: 'rated', label: 'Rated', icon: <Star size={18} /> },
    { id: 'comments', label: 'Comments', icon: <MessageSquare size={18} /> },
    { id: 'badges', label: 'Badges', icon: <Shield size={18} /> }
  ];

  return (
    <div className="min-h-screen pt-24 px-4 pb-20 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center">
          <div className="w-24 h-24 rounded-full bg-cyan-500/20 border-2 border-cyan-500 mx-auto mb-4 flex items-center justify-center text-3xl font-black text-cyan-500 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
            {username?.[0]?.toUpperCase()}
          </div>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <h1 className="text-3xl font-black text-white glow-text">{username}</h1>
            {hasVerifiedBadge && (
              <img src="https://i.ibb.co/Ndn76SMc/IMG-20260630-WA0057.jpg" alt="Verified" className="w-6 h-6 rounded-full" />
            )}
          </div>
          
          <div className="flex items-center justify-center space-x-6 mt-4">
            <div className="text-gray-400">
              <span className="text-white font-bold">{followers}</span> Followers
            </div>
            {profileUserId && (!currentUser || currentUser.id !== profileUserId) && (
              <button 
                onClick={handleFollow}
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-sm font-bold transition-all ${isFollowing ? 'bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400 border border-white/10' : 'bg-cyan-500 text-white hover:bg-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.3)]'}`}
              >
                {isFollowing ? (
                  <>
                    <Check size={14} />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={14} />
                    <span>Follow</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-center mb-8 flex-wrap gap-2">
          <div className="glass p-1 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap max-w-full overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 sm:px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(0,255,255,0.3)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : (
          <div>
            {activeTab === 'badges' && (
              <div>
                {badges.length === 0 ? (
                  <p className="text-center text-gray-500 py-10">No badges earned yet.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {badges.map(badge => (
                      <AchievementBadge 
                        key={badge.id}
                        badgeName={badge.badge_name}
                        iconUrl={badge.badge_types?.icon_url}
                        description={badge.badge_types?.description}
                        earnedAt={badge.earned_at}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'wishlist' && (
              <div>
                {wishlist.length === 0 ? (
                  <p className="text-center text-gray-500 py-10">No games in wishlist.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {wishlist.map(game => (
                      <div key={game.id} className="relative group">
                        <GameCard game={game} />
                        <button
                          onClick={(e) => { e.preventDefault(); removeFromWishlist(game.id); }}
                          className="absolute top-3 right-3 p-2 rounded-xl glass bg-black/50 border border-white/10 text-red-400 hover:text-red-300 hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100 z-10"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'rated' && (
              <div>
                {rated.length === 0 ? (
                  <p className="text-center text-gray-500 py-10">No rated games yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {rated.map(game => (
                      <div key={game.id} className="relative">
                        <GameCard game={game} />
                        <div className="absolute top-3 right-3 px-3 py-1 rounded-xl glass bg-black/60 border border-white/10 text-yellow-400 font-bold flex items-center space-x-1 z-10">
                          <Star size={14} className="fill-yellow-400" />
                          <span>{game.userRating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="max-w-3xl mx-auto space-y-4">
                {comments.length === 0 ? (
                  <p className="text-center text-gray-500 py-10">No comments yet.</p>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="glass p-6 rounded-2xl bg-white/5 border border-white/10 transition-all hover:bg-white/10">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm text-gray-500 font-medium">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                        <Link 
                          href={`/game/${comment.games?.slug}`}
                          className="flex items-center space-x-1 text-xs px-3 py-1 rounded-lg glass bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                        >
                          <Edit2 size={12} />
                          <span>View on Game</span>
                        </Link>
                      </div>
                      <p className="text-gray-300">{comment.content}</p>
                      {comment.games && (
                        <div className="mt-4 pt-3 border-t border-white/10 flex items-center space-x-3">
                          <img src={comment.games.data?.image} alt={comment.games.data?.title} className="w-8 h-8 rounded border border-white/10 object-cover" />
                          <span className="text-sm font-bold text-gray-400">{comment.games.data?.title}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
