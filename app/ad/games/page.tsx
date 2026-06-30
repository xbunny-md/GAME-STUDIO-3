'use client';
export const dynamic = 'force-dynamic';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../src/lib/supabase';
import { toast } from 'sonner';
import { Plus, Trash, Save, Edit } from 'lucide-react';
import GlassModal from '../../../src/components/GlassModal';

export default function GamesPage() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('PC');
  const [size, setSize] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [downloads, setDownloads] = useState<{ name: string; url: string; color: string; icon: string }[]>([{ name: '', url: '', color: '#06b6d4', icon: 'download' }]);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    const { data } = await supabase.from('games').select('*').order('created_at', { ascending: false });
    if (data) setGames(data);
    setLoading(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle(''); setSlug(''); setSize(''); setImage(''); setDescription(''); setCategory('PC');
    setDownloads([{ name: '', url: '', color: '#06b6d4', icon: 'download' }]);
    setIsGameModalOpen(false);
  };

  const handleEditClick = (game: any) => {
    setEditingId(game.id);
    setTitle(game.data.title || '');
    setSlug(game.slug || '');
    setCategory(game.data.category || 'PC');
    setSize(game.data.size || '');
    setImage(game.data.image || '');
    setDescription(game.data.description || '');
    setDownloads(game.data.downloads?.length ? game.data.downloads : [{ name: '', url: '', color: '#06b6d4', icon: 'download' }]);
    setIsGameModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    const { error } = await supabase.from('games').delete().eq('id', deleteConfirmId);
    if (!error) {
      toast.success('Game deleted successfully');
      fetchGames();
    } else {
      toast.error('Failed to delete game');
    }
    setDeleteConfirmId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const gameData = {
      title,
      category,
      size,
      image,
      description,
      downloads: downloads.filter(d => d.name.trim() !== '' && d.url.trim() !== '')
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('games').update({ slug, data: gameData }).eq('id', editingId);
        if (!error) {
          toast.success('Game updated successfully!');
          resetForm();
          fetchGames();
        } else {
          toast.error(error.message || 'Failed to update game');
        }
      } else {
        const { error } = await supabase.from('games').insert({ slug, data: gameData });
        if (!error) {
          toast.success('Game added successfully!');
          resetForm();
          fetchGames();
        } else {
          toast.error(error.message || 'Failed to add game');
        }
      }
    } catch (error) {
      toast.error('An error occurred');
    }
    setFormLoading(false);
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

  if (loading) return <div className="text-cyan-500 font-bold">Loading games...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black glow-text">Manage Games</h1>
        <button onClick={() => setIsGameModalOpen(true)} className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 rounded-xl text-white font-bold transition-all text-sm flex items-center space-x-2 shadow-[0_0_15px_rgba(0,255,255,0.3)] glow-hover">
          <Plus size={16} /> <span>Add Game</span>
        </button>
      </div>

      <div className="glass rounded-3xl bg-white/50 dark:bg-white/5 overflow-hidden border border-black/10 dark:border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="p-4 font-bold">Cover</th>
                <th className="p-4 font-bold">Title</th>
                <th className="p-4 font-bold">Platform</th>
                <th className="p-4 font-bold">Views</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 dark:divide-white/10">
              {games.map(game => (
                <tr key={game.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-gray-800 dark:text-gray-200">
                  <td className="p-4">
                    <img src={game.data.image} alt={game.data.title} className="w-16 h-10 object-cover rounded-lg border border-black/10 dark:border-white/10" />
                  </td>
                  <td className="p-4 font-bold">{game.data.title}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-cyan-500/20 text-cyan-600 dark:text-cyan-500 rounded text-xs border border-cyan-500/30">
                      {game.data.category}
                    </span>
                  </td>
                  <td className="p-4">{game.views || 0}</td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => handleEditClick(game)}
                      className="px-3 py-1 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 rounded-lg font-bold transition-colors text-sm inline-flex items-center gap-1"
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button 
                      onClick={() => setDeleteConfirmId(game.id)}
                      className="px-3 py-1 bg-red-500/10 dark:bg-red-500/20 hover:bg-red-500/20 dark:hover:bg-red-500/40 text-red-600 dark:text-red-500 rounded-lg font-bold transition-colors text-sm inline-flex items-center gap-1"
                    >
                      <Trash size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {games.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">No games found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <GlassModal 
        isOpen={isGameModalOpen} 
        onClose={resetForm} 
        title={editingId ? "Edit Game" : "Add New Game"}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Title</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full glass-dark rounded-xl px-4 py-3 outline-none focus:border-cyan-500 text-gray-900 dark:text-white border border-black/10 dark:border-white/10 bg-white/50 dark:bg-transparent" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Slug (URL friendly)</label>
              <input type="text" required value={slug} onChange={e => setSlug(e.target.value)} className="w-full glass-dark rounded-xl px-4 py-3 outline-none focus:border-cyan-500 text-gray-900 dark:text-white border border-black/10 dark:border-white/10 bg-white/50 dark:bg-transparent" placeholder="e.g. half-life-2" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Platform (Category)</label>
              <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full glass-dark rounded-xl px-4 py-3 outline-none focus:border-cyan-500 text-gray-900 dark:text-white border border-black/10 dark:border-white/10 bg-white/50 dark:bg-transparent [&>option]:bg-white dark:[&>option]:bg-gray-900">
                <option value="PC">PC</option>
                <option value="Android">Android</option>
                <option value="PlayStation">PlayStation</option>
                <option value="PPSSPP">PPSSPP</option>
                <option value="iOS">iOS</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Size</label>
              <input type="text" value={size} onChange={e => setSize(e.target.value)} className="w-full glass-dark rounded-xl px-4 py-3 outline-none focus:border-cyan-500 text-gray-900 dark:text-white border border-black/10 dark:border-white/10 bg-white/50 dark:bg-transparent" placeholder="e.g. 1.5 GB" />
            </div>
            <div className="col-span-full space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Cover Image URL</label>
              <input type="url" required value={image} onChange={e => setImage(e.target.value)} className="w-full glass-dark rounded-xl px-4 py-3 outline-none focus:border-cyan-500 text-gray-900 dark:text-white border border-black/10 dark:border-white/10 bg-white/50 dark:bg-transparent" />
            </div>
            <div className="col-span-full space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Description</label>
              <textarea required rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full glass-dark rounded-xl px-4 py-3 outline-none focus:border-cyan-500 text-gray-900 dark:text-white border border-black/10 dark:border-white/10 bg-white/50 dark:bg-transparent resize-none" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-2">
              <h3 className="font-bold text-gray-900 dark:text-white">Download Links</h3>
              <button type="button" onClick={() => handleAddItem(setDownloads, {name: '', url: '', color: '#06b6d4', icon: 'download'})} className="text-cyan-600 dark:text-cyan-500 p-1 hover:bg-cyan-500/10 rounded"><Plus size={18} /></button>
            </div>
            {downloads.map((dl, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-2">
                <input type="text" value={dl.name} onChange={e => handleUpdateItem(setDownloads, idx, { ...dl, name: e.target.value })} className="flex-1 glass-dark rounded-xl px-4 py-2 outline-none focus:border-cyan-500 text-gray-900 dark:text-white border border-black/10 dark:border-white/10 bg-white/50 dark:bg-transparent" placeholder="Link Name (e.g. Mega)" />
                <input type="text" value={dl.url} onChange={e => handleUpdateItem(setDownloads, idx, { ...dl, url: e.target.value })} className="flex-1 glass-dark rounded-xl px-4 py-2 outline-none focus:border-cyan-500 text-gray-900 dark:text-white border border-black/10 dark:border-white/10 bg-white/50 dark:bg-transparent" placeholder="URL" />
                <button type="button" onClick={() => handleRemoveItem(setDownloads, idx)} className="text-red-500 p-2"><Trash size={18} /></button>
              </div>
            ))}
          </div>

          <div className="flex space-x-4 pt-4 border-t border-black/10 dark:border-white/10">
            <button type="submit" disabled={formLoading} className="flex-1 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold flex items-center justify-center space-x-2 transition-all glow-hover disabled:opacity-50 shadow-[0_0_15px_rgba(0,255,255,0.3)]">
              <Save size={20} />
              <span>{formLoading ? 'Saving...' : (editingId ? 'Update Game' : 'Save Game')}</span>
            </button>
            <button type="button" onClick={resetForm} className="px-6 py-4 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-gray-900 dark:text-white font-bold transition-all border border-black/10 dark:border-white/10">
              Cancel
            </button>
          </div>
        </form>
      </GlassModal>

      <GlassModal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Confirm Delete">
        <div className="space-y-6">
          <p className="text-gray-700 dark:text-gray-300 font-medium">Are you sure you want to delete this game? This cannot be undone.</p>
          <div className="flex space-x-4">
            <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-gray-900 dark:text-white font-bold transition-all">
              Cancel
            </button>
            <button onClick={handleDelete} className="flex-1 py-3 rounded-xl bg-red-500/80 hover:bg-red-500 text-white font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              Delete
            </button>
          </div>
        </div>
      </GlassModal>
    </div>
  );
}
