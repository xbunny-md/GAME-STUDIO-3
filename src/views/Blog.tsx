'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import GlassModal from '../components/GlassModal';
import { toast } from 'sonner';

export default function Blog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [newPost, setNewPost] = useState({ title: '', slug: '', cover: '', content: '' });

  useEffect(() => {
    fetchPosts();
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data } = await supabase.from('profiles').select('is_admin').eq('id', session.user.id).single();
      setIsAdmin(!!data?.is_admin);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (data) setPosts(data);
    setLoading(false);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('posts').insert({
      ...newPost,
      content: { text: newPost.content }
    });
    if (error) {
      toast.error('Error creating post');
    } else {
      toast.success('Post created!', { className: 'glass bg-white/10 text-white border-white/10' });
      setIsModalOpen(false);
      setNewPost({ title: '', slug: '', cover: '', content: '' });
      fetchPosts();
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    const { error } = await supabase.from('posts').delete().eq('id', deleteConfirmId);
    if (!error) {
      toast.success('Post deleted', { className: 'glass bg-white/10 text-white border-white/10' });
      fetchPosts();
    }
    setDeleteConfirmId(null);
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-20 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black text-cyan-500 glow-text">GAMES STUDIO NEWS</h1>
          {isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold transition-all shadow-[0_0_15px_rgba(0,255,255,0.3)] glow-hover"
            >
              <Plus size={20} />
              <span>New Post</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="glass rounded-3xl bg-white/5 border border-white/10 overflow-hidden group hover:bg-white/10 transition-all flex flex-col shadow-[0_0_20px_rgba(0,255,255,0.02)]">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img 
                    src={post.cover} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {isAdmin && (
                    <button
                      onClick={(e) => handleDelete(post.id, e)}
                      className="absolute top-3 right-3 p-2 rounded-xl glass bg-black/50 border border-white/10 text-red-400 hover:text-red-300 hover:bg-black/80 transition-all z-10"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <span className="text-cyan-500 font-bold text-sm mb-2">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                  <h2 className="text-xl font-bold text-white mb-3 line-clamp-2">{post.title}</h2>
                  <p className="text-gray-400 line-clamp-3 text-sm flex-1">
                    {post.content?.text}
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/10 text-cyan-400 font-bold text-sm group-hover:text-cyan-300 transition-colors">
                    Read More →
                  </div>
                </div>
              </Link>
            ))}
            {posts.length === 0 && (
              <div className="col-span-full text-center py-20 text-gray-500">
                No news posts yet. Check back later!
              </div>
            )}
          </div>
        )}
      </div>

      <GlassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Post">
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-300">Title</label>
            <input required type="text" value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} className="w-full mt-1 glass-dark rounded-xl px-4 py-3 outline-none focus:border-cyan-500 text-white border border-white/10" />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-300">URL Slug</label>
            <input required type="text" value={newPost.slug} onChange={e => setNewPost({...newPost, slug: e.target.value})} className="w-full mt-1 glass-dark rounded-xl px-4 py-3 outline-none focus:border-cyan-500 text-white border border-white/10" placeholder="my-awesome-post" />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-300">Cover Image URL</label>
            <input required type="url" value={newPost.cover} onChange={e => setNewPost({...newPost, cover: e.target.value})} className="w-full mt-1 glass-dark rounded-xl px-4 py-3 outline-none focus:border-cyan-500 text-white border border-white/10" />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-300">Content</label>
            <textarea required rows={5} value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})} className="w-full mt-1 glass-dark rounded-xl px-4 py-3 outline-none focus:border-cyan-500 text-white border border-white/10 resize-none"></textarea>
          </div>
          <button type="submit" className="w-full py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold transition-all shadow-[0_0_15px_rgba(0,255,255,0.3)] glow-hover">
            Publish Post
          </button>
        </form>
      </GlassModal>

      <GlassModal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Confirm Delete">
        <div className="space-y-6">
          <p className="text-gray-300">Are you sure you want to delete this post? This cannot be undone.</p>
          <div className="flex space-x-4">
            <button 
              onClick={() => setDeleteConfirmId(null)}
              className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={confirmDelete}
              className="flex-1 py-3 rounded-xl bg-red-500/80 hover:bg-red-500 text-white font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            >
              Delete
            </button>
          </div>
        </div>
      </GlassModal>
    </div>
  );
}
