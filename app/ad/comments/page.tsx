'use client';
export const dynamic = 'force-dynamic';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../src/lib/supabase';
import { toast } from 'sonner';
import { Trash } from 'lucide-react';
import GlassModal from '../../../src/components/GlassModal';

export default function CommentsPage() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    const { data } = await supabase.from('comments').select('*, games(data, slug)').order('created_at', { ascending: false });
    if (data) setComments(data);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    const { error } = await supabase.from('comments').delete().eq('id', deleteConfirmId);
    if (!error) {
      toast.success('Comment deleted successfully');
      fetchComments();
    } else {
      toast.error('Failed to delete comment');
    }
    setDeleteConfirmId(null);
  };

  if (loading) return <div className="text-cyan-500 font-bold">Loading comments...</div>;

  return (
    <div>
      <h1 className="text-3xl font-black glow-text mb-8">Manage Comments</h1>
      <div className="glass rounded-3xl bg-white/50 dark:bg-white/5 overflow-hidden border border-black/10 dark:border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="p-4 font-bold">Author</th>
                <th className="p-4 font-bold">Content</th>
                <th className="p-4 font-bold">Game</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 dark:divide-white/10">
              {comments.map(comment => (
                <tr key={comment.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-gray-800 dark:text-gray-200">
                  <td className="p-4">{comment.user_email}</td>
                  <td className="p-4 truncate max-w-[200px]">{comment.content}</td>
                  <td className="p-4">{comment.games?.data?.title || '-'}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => setDeleteConfirmId(comment.id)}
                      className="px-3 py-1 bg-red-500/10 dark:bg-red-500/20 hover:bg-red-500/20 dark:hover:bg-red-500/40 text-red-600 dark:text-red-500 rounded-lg font-bold transition-colors text-sm inline-flex items-center gap-1"
                    >
                      <Trash size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {comments.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500 font-medium">No comments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <GlassModal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Confirm Delete">
        <div className="space-y-6">
          <p className="text-gray-700 dark:text-gray-300 font-medium">Are you sure you want to delete this comment?</p>
          <div className="flex space-x-4">
            <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-gray-900 dark:text-white font-bold transition-all">Cancel</button>
            <button onClick={handleDelete} className="flex-1 py-3 rounded-xl bg-red-500/80 hover:bg-red-500 text-white font-bold transition-all">Delete</button>
          </div>
        </div>
      </GlassModal>
    </div>
  );
}
