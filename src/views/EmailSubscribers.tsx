'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Mail } from 'lucide-react';
import Link from 'next/link';

export default function EmailSubscribers() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('notify_new_games', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSubscribers(data);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-20 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-cyan-500 glow-text flex items-center gap-3">
            <Mail size={32} />
            Email Subscribers
          </h1>
          <Link href="/admin" className="px-4 py-2 glass rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors font-bold text-gray-900 dark:text-white">
            Back to Admin
          </Link>
        </div>

        <div className="glass rounded-3xl bg-white/5 dark:bg-black/20 overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(0,255,255,0.05)]">
          <div className="p-6 border-b border-white/10 bg-black/10 dark:bg-white/5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Total Active: <span className="text-cyan-500">{subscribers.length}</span>
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500"></div>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-300">
                  <tr>
                    <th className="p-4 font-bold">Email Address</th>
                    <th className="p-4 font-bold">Joined At</th>
                    <th className="p-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {subscribers.map(sub => (
                    <tr key={sub.id} className="hover:bg-white/5 transition-colors text-gray-800 dark:text-gray-200">
                      <td className="p-4 font-medium">{sub.email}</td>
                      <td className="p-4 text-gray-500">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-bold border border-green-500/30">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                  {subscribers.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-gray-500">
                        No subscribers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
