'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Edit2, Trash2, Heart, MessageSquare } from 'lucide-react';
import GlassModal from './GlassModal';
import GlassSelect from './GlassSelect';
import Link from 'next/link';

interface Comment {
  id: string;
  game_id: string;
  user_id: string;
  user_email: string;
  content: string;
  created_at: string;
  updated_at: string | null;
  likes_count: number;
  user_has_liked: boolean;
}

export default function CommentBox({ gameId, gameSlug }: { gameId: string, gameSlug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
        setIsAdmin(!!profile?.is_admin);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
        setIsAdmin(!!profile?.is_admin);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (gameId) {
      fetchComments();
    }
  }, [gameId, sortBy, user]);

  const fetchComments = async () => {
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .eq('game_id', gameId)
      .order('created_at', { ascending: sortBy === 'oldest' });

    if (commentsError) {
      console.error(commentsError);
      return;
    }

    if (!commentsData) return;

    let likesData: any[] = [];
    if (user) {
      const { data } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', user.id);
      likesData = data || [];
    }

    const commentIds = commentsData.map(c => c.id);
    const userIds = [...new Set(commentsData.map(c => c.user_id))];

    const { data: allLikes } = await supabase
      .from('comment_likes')
      .select('comment_id')
      .in('comment_id', commentIds);

    let profilesMap: Record<string, boolean> = {};
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, is_verified, email')
        .in('id', userIds);
      if (profilesData) {
        profilesData.forEach(p => {
          profilesMap[p.id] = !!p.is_verified;
          // Predefined auto-verified admin accounts
          if (['qbotmanager@gmail.com', 'lupinstarnley009@gmail.com'].includes(p.email)) {
             profilesMap[p.id] = true;
          }
        });
      }
    }

    const formattedComments = commentsData.map(c => ({
      ...c,
      likes_count: allLikes?.filter(l => l.comment_id === c.id).length || 0,
      user_has_liked: likesData.some(l => l.comment_id === c.id),
      is_verified: profilesMap[c.user_id] || false
    }));

    setComments(formattedComments as any);
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    if (!user) return;

    const { error } = await supabase.from('comments').insert({
      game_id: gameId,
      user_id: user.id,
      user_email: user.email,
      content: newComment.trim(),
    });

    if (error) {
      toast.error('Failed to post comment');
    } else {
      toast.success('Comment posted!', {
        className: 'glass bg-white/10 border-white/10 text-white'
      });
      setNewComment('');
      fetchComments();
    }
  };

  const handleUpdateComment = async (id: string) => {
    if (!editContent.trim()) return;

    const { error } = await supabase.from('comments').update({
      content: editContent.trim(),
      updated_at: new Date().toISOString()
    }).eq('id', id).eq('user_id', user.id);

    if (error) {
      toast.error('Failed to update');
    } else {
      toast.success('Comment updated', {
        className: 'glass bg-white/10 border-white/10 text-white'
      });
      setEditingId(null);
      fetchComments();
    }
  };

  const handleDeleteComment = async () => {
    if (!deleteId) return;

    let query = supabase.from('comments').delete().eq('id', deleteId);
    if (!isAdmin) {
      query = query.eq('user_id', user?.id);
    }

    const { error } = await query;
    if (error) {
      toast.error('Failed to delete');
    } else {
      toast.success('Comment deleted', {
        className: 'glass bg-white/10 border-white/10 text-white'
      });
      setDeleteId(null);
      fetchComments();
    }
  };

  const handleToggleLike = async (commentId: string, hasLiked: boolean) => {
    if (!user) {
      toast.error('Login to like comments', {
        className: 'glass bg-white/10 border-white/10 text-white'
      });
      return;
    }

    if (hasLiked) {
      await supabase.from('comment_likes').delete().eq('comment_id', commentId).eq('user_id', user.id);
    } else {
      await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: user.id });
    }
    fetchComments();
  };

  return (
    <div className="mt-12 w-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-black text-cyan-500 glow-text flex items-center gap-2">
          <MessageSquare size={24} />
          Comments
        </h3>
        <div className="w-40">
          <GlassSelect 
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'newest', label: 'Newest' },
              { value: 'oldest', label: 'Oldest' }
            ]}
          />
        </div>
      </div>

      {user ? (
        <div className="glass p-6 rounded-3xl bg-white/5 border border-white/10 mb-8 shadow-[0_0_20px_rgba(0,255,255,0.05)]">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value.substring(0, 500))}
            placeholder="Write a comment..."
            className="w-full glass-dark rounded-xl px-4 py-3 outline-none focus:border-cyan-500 text-gray-200 border border-white/10 transition-colors resize-none h-24 mb-2"
          ></textarea>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 font-bold">{newComment.length}/500</span>
            <button
              onClick={handlePostComment}
              disabled={!newComment.trim()}
              className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold transition-all shadow-[0_0_15px_rgba(0,255,255,0.3)] glow-hover disabled:opacity-50"
            >
              Post Comment
            </button>
          </div>
        </div>
      ) : (
        <div className="glass p-8 rounded-3xl bg-white/5 border border-white/10 mb-8 flex flex-col items-center justify-center text-center">
          <MessageSquare size={48} className="text-gray-500 mb-4" />
          <p className="text-gray-400 mb-4">Join the discussion with other gamers.</p>
          <Link
            href="/login"
            className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-cyan-500 font-bold transition-all shadow-[0_0_15px_rgba(0,255,255,0.1)] glow-hover"
          >
            Login to Comment
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="glass p-5 rounded-2xl bg-white/5 border border-white/10 transition-all hover:bg-white/10">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-3">
                <Link href={`/u/${comment.user_email?.split('@')[0]}`} className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
                  {comment.user_email?.split('@')[0]}
                  {(comment as any).is_verified && (
                    <img src="https://i.ibb.co/Ndn76SMc/IMG-20260630-WA0057.jpg" alt="Verified" className="w-4 h-4 rounded-full" />
                  )}
                </Link>
                <span className="text-xs text-gray-500 font-medium">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
                {comment.updated_at && (
                  <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">Edited</span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleLike(comment.id, comment.user_has_liked)}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-sm transition-colors ${comment.user_has_liked ? 'text-pink-500 bg-pink-500/10' : 'text-gray-400 hover:text-pink-400 hover:bg-white/5'}`}
                >
                  <Heart size={14} className={comment.user_has_liked ? 'fill-pink-500' : ''} />
                  <span>{comment.likes_count}</span>
                </button>
                
                {(user?.id === comment.user_id || isAdmin) && (
                  <div className="flex space-x-1 ml-2">
                    {user?.id === comment.user_id && (
                      <button 
                        onClick={() => {
                          setEditingId(comment.id);
                          setEditContent(comment.content);
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                    <button 
                      onClick={() => setDeleteId(comment.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {editingId === comment.id ? (
              <div className="mt-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value.substring(0, 500))}
                  className="w-full glass-dark rounded-xl px-4 py-2 outline-none focus:border-cyan-500 text-gray-200 border border-white/10 transition-colors resize-none h-20 mb-2"
                ></textarea>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateComment(comment.id)}
                    disabled={!editContent.trim()}
                    className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-sm transition-all shadow-[0_0_10px_rgba(0,255,255,0.3)] disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-300 whitespace-pre-wrap">{comment.content}</p>
            )}
          </div>
        ))}
        {comments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No comments yet. Be the first to share your thoughts!
          </div>
        )}
      </div>

      <GlassModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Comment"
      >
        <p className="text-gray-300 mb-6">Are you sure you want to delete this comment? This action cannot be undone.</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setDeleteId(null)}
            className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors border border-white/10"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteComment}
            className="px-6 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]"
          >
            Delete
          </button>
        </div>
      </GlassModal>
    </div>
  );
}
