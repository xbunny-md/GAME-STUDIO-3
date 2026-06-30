'use client';
export const dynamic = 'force-dynamic';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../src/lib/supabase';
import { toast } from 'sonner';
import GlassModal from '../../../src/components/GlassModal';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: authData } = await supabase.auth.admin.listUsers();
      const { data: profilesData } = await supabase.from('profiles').select('*');
      
      if (authData?.users) {
        const mergedUsers = authData.users.map(u => {
          const profile = profilesData?.find(p => p.id === u.id) || {};
          return {
            id: u.id,
            email: u.email,
            created_at: u.created_at,
            avatar_url: u.user_metadata?.avatar_url || profile.avatar_url || null,
            is_admin: profile.is_admin || false,
            is_verified: profile.is_verified || false
          };
        }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setUsers(mergedUsers);
      } else if (profilesData) {
        setUsers(profilesData);
      }
    } catch (e) {
      console.log('Admin sync failed', e);
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (data) setUsers(data);
    }
    setLoading(false);
  };

  const handleToggleVerified = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase.from('profiles').update({ is_verified: !currentStatus }).eq('id', userId);
    if (!error) {
      toast.success('Verification status updated');
      fetchUsers();
    } else {
      toast.error('Failed to update verification status');
    }
  };

  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase.from('profiles').update({ is_admin: !currentStatus }).eq('id', userId);
    if (!error) {
      toast.success('Admin status updated');
      fetchUsers();
    } else {
      toast.error('Failed to update admin status');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    const { error } = await supabase.from('profiles').delete().eq('id', deleteConfirmId);
    if (!error) {
      toast.success('User deleted successfully');
      fetchUsers();
    } else {
      toast.error('Failed to delete user');
    }
    setDeleteConfirmId(null);
  };

  if (loading) return <div className="text-cyan-500 font-bold">Loading users...</div>;

  return (
    <div>
      <h1 className="text-3xl font-black glow-text mb-8">Manage Users</h1>
      <div className="glass rounded-3xl bg-white/50 dark:bg-white/5 overflow-hidden border border-black/10 dark:border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="p-4 font-bold">Email</th>
                <th className="p-4 font-bold">Joined</th>
                <th className="p-4 font-bold">Admin</th>
                <th className="p-4 font-bold">Verified</th>
                <th className="p-4 font-bold">Avatar</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 dark:divide-white/10">
              {users.map(user => {
                let isVer = !!user.is_verified;
                if (['qbotmanager@gmail.com', 'lupinstarnley009@gmail.com'].includes(user.email)) {
                  isVer = true;
                }
                return (
                  <tr key={user.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-gray-800 dark:text-gray-200">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.email}</span>
                        {isVer && (
                          <img 
                            src="https://i.ibb.co/Ndn76SMc/IMG-20260630-WA0057.jpg" 
                            alt="Verified" 
                            className="w-4 h-4 rounded-full"
                          />
                        )}
                      </div>
                    </td>
                    <td className="p-4">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      {user.is_admin ? <span className="text-cyan-500 font-bold">Yes</span> : <span className="text-gray-400">No</span>}
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleToggleVerified(user.id, !!user.is_verified)}
                        className={`px-3 py-1 rounded-lg font-bold transition-colors text-sm ${user.is_verified ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30' : 'bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-black/10 dark:border-white/10'}`}
                      >
                        {user.is_verified ? 'Verified' : 'Verify'}
                      </button>
                    </td>
                    <td className="p-4">
                      <img 
                        src={user.avatar_url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
                        alt="Avatar" 
                        className="w-10 h-10 rounded-full object-cover border border-black/10 dark:border-white/20 shadow-sm"
                      />
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => handleToggleAdmin(user.id, !!user.is_admin)}
                        className={`px-3 py-1 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 rounded-lg font-bold transition-colors text-sm ${user.is_admin ? 'text-red-500 dark:text-red-400' : 'text-cyan-600 dark:text-cyan-400'}`}
                      >
                        {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmId(user.id)}
                        className="px-3 py-1 bg-red-500/10 dark:bg-red-500/20 hover:bg-red-500/20 dark:hover:bg-red-500/40 text-red-600 dark:text-red-500 rounded-lg font-bold transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 font-medium">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <GlassModal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Confirm Delete">
        <div className="space-y-6">
          <p className="text-gray-700 dark:text-gray-300 font-medium">Are you sure you want to delete this user? This cannot be undone.</p>
          <div className="flex space-x-4">
            <button 
              onClick={() => setDeleteConfirmId(null)}
              className="flex-1 py-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-gray-900 dark:text-white font-bold transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleDelete}
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
