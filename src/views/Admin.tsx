'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Plus, Trash, Save } from 'lucide-react';
import Link from 'next/link';
import ModernTabs from '../components/ModernTabs';
import GlassModal from '../components/GlassModal';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const router = useRouter();

  // Admin Data State
  const [games, setGames] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('games');
  const [stats, setStats] = useState({ total: 0, views: 0, popular: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('PC');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [videos, setVideos] = useState<string[]>(['']);
  const [steps, setSteps] = useState<string[]>(['']);
  const [screenshots, setScreenshots] = useState<string[]>(['']);
  const [specs, setSpecs] = useState<{ label: string; value: string }[]>([{ label: '', value: '' }]);
  const [downloads, setDownloads] = useState<{ name: string; url: string; color: string; icon: string }[]>([{ name: '', url: '', color: '#06b6d4', icon: 'download' }]);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'game'|'user'|'post'|'comment'|null>(null);

  useEffect(() => {
    const checkSession = sessionStorage.getItem('adminAuth');
    if (checkSession === 'true') {
      setIsAuthenticated(true);
      fetchAdminData();
    } else {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user?.email && ['qbotmanager@gmail.com', 'lupinstarnley009@gmail.com'].includes(session.user.email)) {
          setIsAuthenticated(true);
          sessionStorage.setItem('adminAuth', 'true');
          fetchAdminData();
        } else if (session?.user) {
          const { data } = await supabase.from('profiles').select('is_admin').eq('id', session.user.id).single();
          if (data?.is_admin) {
            setIsAuthenticated(true);
            sessionStorage.setItem('adminAuth', 'true');
            fetchAdminData();
          }
        }
      });
    }
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (['qbotmanager@gmail.com', 'lupinstarnley009@gmail.com'].includes(adminEmail) && adminPassword === '2892') {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
      fetchAdminData();
      toast.success('Admin Access Granted', { className: 'glass bg-cyan-500/20 text-cyan-500 border-cyan-500/20' });
    } else {
      toast.error('Invalid Admin Credentials', { className: 'glass bg-red-500/20 text-red-500 border-red-500/20' });
      router.push('/');
    }
  };

  const fetchAdminData = async () => {
    const { data: gData } = await supabase.from('games').select('*').order('created_at', { ascending: false });
    if (gData) {
      setGames(gData);
      const total = gData.length;
      const views = gData.reduce((acc, g) => acc + (g.views || 0), 0);
      let popular = '';
      if (gData.length > 0) {
        const sorted = [...gData].sort((a, b) => (b.views || 0) - (a.views || 0));
        popular = sorted[0].data.title || '';
      }
      setStats({ total, views, popular });
    }

    const { data: uData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (uData) setUsers(uData);

    const { data: pData } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (pData) setPosts(pData);

    const { data: cData } = await supabase.from('comments').select('*, games(data, slug)').order('created_at', { ascending: false });
    if (cData) setComments(cData);
  };

  const handleLogout = async () => {
    sessionStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    router.push('/');
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle(''); setSlug(''); setImage(''); setDescription('');
    setVideos(['']); setSteps(['']); setScreenshots(['']);
    setSpecs([{ label: '', value: '' }]);
    setDownloads([{ name: '', url: '', color: '#06b6d4', icon: 'download' }]);
    setIsGameModalOpen(false);
  };

  const handleEditClick = (game: any) => {
    setEditingId(game.id);
    setTitle(game.data.title || '');
    setSlug(game.slug || '');
    setCategory(game.data.category || 'PC');
    setImage(game.data.image || '');
    setDescription(game.data.description || '');
    setVideos(game.data.videos?.length ? game.data.videos : ['']);
    setSteps(game.data.steps?.length ? game.data.steps : ['']);
    setScreenshots(game.data.screenshots?.length ? game.data.screenshots : ['']);
    setSpecs(game.data.specs?.length ? game.data.specs : [{ label: '', value: '' }]);
    setDownloads(game.data.downloads?.length ? game.data.downloads : [{ name: '', url: '', color: '#06b6d4', icon: 'download' }]);
    setIsGameModalOpen(true);
  };

  const handleDelete = async (id: string, type: 'game'|'user'|'post'|'comment') => {
    setDeleteConfirmId(id);
    setDeleteType(type);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId || !deleteType) return;
    
    let table = 'games';
    if (deleteType === 'user') table = 'profiles';
    if (deleteType === 'post') table = 'posts';
    if (deleteType === 'comment') table = 'comments';

    const { error } = await supabase.from(table).delete().eq('id', deleteConfirmId);
    if (error) {
      toast.error(`Failed to delete ${deleteType}`);
    } else {
      toast.success(`${deleteType} deleted successfully`);
      fetchAdminData();
    }
    setDeleteConfirmId(null);
    setDeleteType(null);
  };

  const handleToggleVerified = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase.from('profiles').update({ is_verified: !currentStatus }).eq('id', userId);
    if (!error) {
      toast.success('Verification status updated');
      fetchAdminData();
    } else {
      toast.error('Failed to update verification status');
    }
  };

  const handleAddItem = (setter: React.Dispatch<React.SetStateAction<any[]>>, defaultItem: any) => {
    setter(prev => [...prev, defaultItem]);
  };

  const handleRemoveItem = (setter: React.Dispatch<React.SetStateAction<any[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (setter: React.Dispatch<React.SetStateAction<any[]>>, index: number, value: any) => {
    setter(prev => {
      const newArray = [...prev];
      newArray[index] = value;
      return newArray;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const gameData = {
      title,
      category,
      image,
      description,
      videos: videos.filter(v => v.trim() !== ''),
      steps: steps.filter(s => s.trim() !== ''),
      screenshots: screenshots.filter(s => s.trim() !== ''),
      specs: specs.filter(s => s.label.trim() !== '' && s.value.trim() !== ''),
      downloads: downloads.filter(d => d.name.trim() !== '' && d.url.trim() !== '')
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from('games')
          .update({ slug, data: gameData })
          .eq('id', editingId);

        if (!error) {
          toast.success('Game updated successfully!');
          resetForm();
          fetchAdminData();
        } else {
          toast.error(error.message || 'Failed to update game');
        }
      } else {
        const res = await fetch('/api/admin/games', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, data: gameData })
        });
        const result = await res.json();
        if (result.success) {
          toast.success('Game added successfully!');
          resetForm();
          fetchAdminData();
        } else {
          toast.error(result.error || 'Failed to add game');
        }
      }
    } catch (error) {
      toast.error('An error occurred');
    }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass p-8 rounded-3xl w-full max-w-md bg-white/5 border border-white/10 animate-in fade-in zoom-in">
          <h2 className="text-2xl font-black text-cyan-500 mb-6 text-center glow-text">Admin Login</h2>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-300">Email</label>
              <input type="email" required value={adminEmail} onChange={e=>setAdminEmail(e.target.value)} className="w-full mt-1 glass-dark rounded-xl px-4 py-3 outline-none focus:border-cyan-500 text-white border border-white/10" placeholder="admin@example.com" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-300">Password</label>
              <input type="password" required value={adminPassword} onChange={e=>setAdminPassword(e.target.value)} className="w-full mt-1 glass-dark rounded-xl px-4 py-3 outline-none focus:border-cyan-500 text-white border border-white/10" placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full py-4 mt-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold transition-all shadow-[0_0_15px_rgba(0,255,255,0.3)] glow-hover">
              Authenticate
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 pb-32 animate-in fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black glow-text">Admin Dashboard</h1>
        <div className="flex space-x-4">
          <Link href="/admin/email-subscribers" className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500/30 transition-colors font-bold text-sm">
            Email Subscribers
          </Link>
          <button onClick={handleLogout} className="px-4 py-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors font-bold text-sm">
            Logout
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass p-6 rounded-3xl bg-white/5 dark:bg-black/20 border border-white/10 glow-hover">
          <h3 className="text-gray-500 dark:text-gray-400 font-bold mb-2">Total Games</h3>
          <p className="text-3xl font-black text-cyan-500 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">{stats.total}</p>
        </div>
        <div className="glass p-6 rounded-3xl bg-white/5 dark:bg-black/20 border border-white/10 glow-hover">
          <h3 className="text-gray-500 dark:text-gray-400 font-bold mb-2">Total Views</h3>
          <p className="text-3xl font-black text-cyan-500 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">{stats.views}</p>
        </div>
        <div className="glass p-6 rounded-3xl bg-white/5 dark:bg-black/20 border border-white/10 glow-hover">
          <h3 className="text-gray-500 dark:text-gray-400 font-bold mb-2">Most Popular Game</h3>
          <p className="text-xl font-black text-cyan-500 truncate drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]" title={stats.popular}>{stats.popular || 'N/A'}</p>
        </div>
      </div>

      <div className="mb-6">
        <ModernTabs 
          tabs={[
            { id: 'games', label: 'Games' },
            { id: 'users', label: 'Users' },
            { id: 'posts', label: 'Posts' },
            { id: 'comments', label: 'Comments' }
          ]} 
          activeTab={activeTab} 
          onChange={setActiveTab} 
        />
      </div>

      {/* Content Area */}
      <div className="glass rounded-3xl bg-white/5 overflow-hidden mb-8 border border-white/10">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white capitalize">Manage {activeTab}</h2>
          {activeTab === 'games' && (
            <button onClick={() => window.scrollTo({ top: document.getElementById('add-game-form')?.offsetTop || 0, behavior: 'smooth' })} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-all text-sm flex items-center space-x-2">
              <Plus size={16} /> <span>Add Game</span>
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-300">
              <tr>
                {activeTab === 'games' && (
                  <>
                    <th className="p-4 font-bold">Title</th>
                    <th className="p-4 font-bold">Category</th>
                    <th className="p-4 font-bold">Views</th>
                    <th className="p-4 font-bold">Downloads</th>
                  </>
                )}
                {activeTab === 'users' && (
                  <>
                    <th className="p-4 font-bold">Email</th>
                    <th className="p-4 font-bold">Joined</th>
                    <th className="p-4 font-bold">Admin</th>
                    <th className="p-4 font-bold">Verified</th>
                  </>
                )}
                {activeTab === 'posts' && (
                  <>
                    <th className="p-4 font-bold">Title</th>
                    <th className="p-4 font-bold">Created</th>
                  </>
                )}
                {activeTab === 'comments' && (
                  <>
                    <th className="p-4 font-bold">Author</th>
                    <th className="p-4 font-bold">Content</th>
                    <th className="p-4 font-bold">Game</th>
                  </>
                )}
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {activeTab === 'games' && games.map(game => (
                <tr key={game.id} className="hover:bg-white/5 transition-colors text-gray-200">
                  <td className="p-4">{game.data.title}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-cyan-500/20 text-cyan-500 rounded text-xs border border-cyan-500/30">
                      {game.data.category}
                    </span>
                  </td>
                  <td className="p-4">{game.views || 0}</td>
                  <td className="p-4">{game.downloads || 0}</td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => handleEditClick(game)}
                      className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-bold transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(game.id, 'game')}
                      className="px-3 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded-lg font-bold transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {activeTab === 'games' && games.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No games found.</td>
                </tr>
              )}

              {activeTab === 'users' && users.map(user => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors text-gray-200">
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="p-4">{user.is_admin ? <span className="text-cyan-500 font-bold">Yes</span> : 'No'}</td>
                  <td className="p-4">
                    <button 
                      onClick={() => handleToggleVerified(user.id, !!user.is_verified)}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors text-sm ${user.is_verified ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-400'}`}
                    >
                      {user.is_verified ? 'Verified' : 'Verify'}
                    </button>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => handleDelete(user.id, 'user')}
                      className="px-3 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded-lg font-bold transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {activeTab === 'users' && users.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No users found.</td>
                </tr>
              )}

              {activeTab === 'posts' && posts.map(post => (
                <tr key={post.id} className="hover:bg-white/5 transition-colors text-gray-200">
                  <td className="p-4">{post.title}</td>
                  <td className="p-4">{new Date(post.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => handleDelete(post.id, 'post')}
                      className="px-3 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded-lg font-bold transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {activeTab === 'posts' && posts.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-500">No posts found.</td>
                </tr>
              )}

              {activeTab === 'comments' && comments.map(comment => (
                <tr key={comment.id} className="hover:bg-white/5 transition-colors text-gray-200">
                  <td className="p-4">{comment.user_email}</td>
                  <td className="p-4 truncate max-w-[200px]">{comment.content}</td>
                  <td className="p-4">{comment.games?.data?.title || '-'}</td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => handleDelete(comment.id, 'comment')}
                      className="px-3 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded-lg font-bold transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {activeTab === 'comments' && comments.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">No comments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Game Modal */}
      <GlassModal 
        isOpen={isGameModalOpen} 
        onClose={resetForm} 
        title={editingId ? "Edit Game" : "Add New Game"}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-8 pb-8">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-300">Title</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full glass-dark rounded-xl px-4 py-2 outline-none focus:border-cyan-500 text-white border border-white/10" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-300">Slug (Unique URL)</label>
              <input type="text" required value={slug} onChange={e => setSlug(e.target.value)} className="w-full glass-dark rounded-xl px-4 py-2 outline-none focus:border-cyan-500 text-white border border-white/10" />
            </div>
            <div className="space-y-2 relative z-10 flex flex-col">
              <label className="text-sm font-bold text-gray-300 mb-1">Category</label>
              <ModernTabs 
                tabs={[
                  { id: 'PC', label: 'PC' },
                  { id: 'Android', label: 'Android' },
                  { id: 'PlayStation', label: 'PlayStation' },
                  { id: 'PPSSPP', label: 'PPSSPP' },
                  { id: 'iOS', label: 'iOS' }
                ]}
                activeTab={category}
                onChange={setCategory}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-300">Cover Image URL</label>
              <input type="url" required value={image} onChange={e => setImage(e.target.value)} className="w-full glass-dark rounded-xl px-4 py-2 outline-none focus:border-cyan-500 text-white border border-white/10" />
            </div>
            <div className="col-span-full space-y-2">
              <label className="text-sm font-bold text-gray-300">Description</label>
              <textarea required rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full glass-dark rounded-xl px-4 py-2 outline-none focus:border-cyan-500 text-white border border-white/10 resize-none" />
            </div>
          </div>

          {/* Repeaters */}
          {/* Videos */}
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h3 className="font-bold text-white">YouTube Video URLs</h3>
              <button type="button" onClick={() => handleAddItem(setVideos, '')} className="text-cyan-500 p-1 hover:bg-cyan-500/10 rounded"><Plus size={18} /></button>
            </div>
            {videos.map((vid, idx) => (
              <div key={idx} className="flex space-x-2">
                <input type="url" value={vid} onChange={e => handleUpdateItem(setVideos, idx, e.target.value)} className="flex-1 glass-dark rounded-xl px-4 py-2 outline-none focus:border-cyan-500 text-white border border-white/10" placeholder="https://youtube.com/watch?v=..." />
                <button type="button" onClick={() => handleRemoveItem(setVideos, idx)} className="text-red-500 p-2"><Trash size={18} /></button>
              </div>
            ))}
          </div>

          {/* Steps */}
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h3 className="font-bold text-white">Installation Steps</h3>
              <button type="button" onClick={() => handleAddItem(setSteps, '')} className="text-cyan-500 p-1 hover:bg-cyan-500/10 rounded"><Plus size={18} /></button>
            </div>
            {steps.map((step, idx) => (
              <div key={idx} className="flex space-x-2">
                <input type="text" value={step} onChange={e => handleUpdateItem(setSteps, idx, e.target.value)} className="flex-1 glass-dark rounded-xl px-4 py-2 outline-none focus:border-cyan-500 text-white border border-white/10" placeholder="Extract the zip file..." />
                <button type="button" onClick={() => handleRemoveItem(setSteps, idx)} className="text-red-500 p-2"><Trash size={18} /></button>
              </div>
            ))}
          </div>

          {/* Screenshots */}
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h3 className="font-bold text-white">Screenshot URLs</h3>
              <button type="button" onClick={() => handleAddItem(setScreenshots, '')} className="text-cyan-500 p-1 hover:bg-cyan-500/10 rounded"><Plus size={18} /></button>
            </div>
            {screenshots.map((shot, idx) => (
              <div key={idx} className="flex space-x-2">
                <input type="url" value={shot} onChange={e => handleUpdateItem(setScreenshots, idx, e.target.value)} className="flex-1 glass-dark rounded-xl px-4 py-2 outline-none focus:border-cyan-500 text-white border border-white/10" placeholder="https://..." />
                <button type="button" onClick={() => handleRemoveItem(setScreenshots, idx)} className="text-red-500 p-2"><Trash size={18} /></button>
              </div>
            ))}
          </div>

          {/* Specs */}
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h3 className="font-bold text-white">System Specs</h3>
              <button type="button" onClick={() => handleAddItem(setSpecs, {label: '', value: ''})} className="text-cyan-500 p-1 hover:bg-cyan-500/10 rounded"><Plus size={18} /></button>
            </div>
            {specs.map((spec, idx) => (
              <div key={idx} className="flex space-x-2">
                <input type="text" value={spec.label} onChange={e => handleUpdateItem(setSpecs, idx, { ...spec, label: e.target.value })} className="w-1/3 glass-dark rounded-xl px-4 py-2 outline-none focus:border-cyan-500 text-white border border-white/10" placeholder="OS" />
                <input type="text" value={spec.value} onChange={e => handleUpdateItem(setSpecs, idx, { ...spec, value: e.target.value })} className="flex-1 glass-dark rounded-xl px-4 py-2 outline-none focus:border-cyan-500 text-white border border-white/10" placeholder="Windows 10 64-bit" />
                <button type="button" onClick={() => handleRemoveItem(setSpecs, idx)} className="text-red-500 p-2"><Trash size={18} /></button>
              </div>
            ))}
          </div>

          {/* Downloads */}
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h3 className="font-bold text-white">Download Links</h3>
              <button type="button" onClick={() => handleAddItem(setDownloads, {name: '', url: '', color: '#06b6d4', icon: 'download'})} className="text-cyan-500 p-1 hover:bg-cyan-500/10 rounded"><Plus size={18} /></button>
            </div>
            {downloads.map((dl, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-2">
                <input type="text" value={dl.name} onChange={e => handleUpdateItem(setDownloads, idx, { ...dl, name: e.target.value })} className="flex-1 glass-dark rounded-xl px-4 py-2 outline-none focus:border-cyan-500 text-white border border-white/10" placeholder="Mega (Part 1)" />
                <input type="text" value={dl.url} onChange={e => handleUpdateItem(setDownloads, idx, { ...dl, url: e.target.value })} className="flex-1 glass-dark rounded-xl px-4 py-2 outline-none focus:border-cyan-500 text-white border border-white/10" placeholder="URL (1dm:// supported)" />
                <div className="flex items-center space-x-2">
                  <input type="color" value={dl.color} onChange={e => handleUpdateItem(setDownloads, idx, { ...dl, color: e.target.value })} className="h-10 w-10 rounded cursor-pointer bg-transparent border-0" />
                  <button type="button" onClick={() => handleRemoveItem(setDownloads, idx)} className="text-red-500 p-2"><Trash size={18} /></button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-4 pt-4 border-t border-white/10">
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold flex items-center justify-center space-x-2 transition-all glow-hover disabled:opacity-50 shadow-[0_0_15px_rgba(0,255,255,0.3)]"
            >
              <Save size={20} />
              <span>{loading ? 'Saving...' : (editingId ? 'Update Game' : 'Save Game')}</span>
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all border border-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
      </GlassModal>

      <GlassModal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Confirm Delete">
        <div className="space-y-6">
          <p className="text-gray-300">Are you sure you want to delete this {deleteType}? This cannot be undone.</p>
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
