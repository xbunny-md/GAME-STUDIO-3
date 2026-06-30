'use client';
import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { ArrowLeft } from 'lucide-react';

export default function BlogPost() {
  const params = useParams();
  const slug = params?.slug;
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    setLoading(true);
    const { data } = await supabase.from('posts').select('*').eq('slug', slug).single();
    if (data) setPost(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen pt-32 text-center text-white">
        <h1 className="text-3xl font-bold mb-4">Post not found</h1>
        <Link href="/blog" className="text-cyan-500 hover:underline">Back to News</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 pb-20 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto">
        <Link href="/blog" className="inline-flex items-center space-x-2 text-cyan-500 font-bold mb-8 hover:text-cyan-400 transition-colors">
          <ArrowLeft size={20} />
          <span>Back to News</span>
        </Link>

        <div className="glass rounded-3xl bg-white/5 border border-white/10 overflow-hidden shadow-[0_0_30px_rgba(0,255,255,0.05)]">
          <div className="relative aspect-[21/9] w-full">
            <img src={post.cover} alt={post.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
              <span className="text-cyan-500 font-bold mb-4 block glow-text">
                {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-white glow-text leading-tight">{post.title}</h1>
            </div>
          </div>
          
          <div className="p-8 md:p-12">
            <div className="prose prose-invert prose-cyan max-w-none prose-p:text-gray-300 prose-headings:text-white prose-a:text-cyan-500">
              {post.content?.text?.split('\n').map((paragraph: string, idx: number) => (
                <p key={idx} className="mb-6 leading-relaxed text-lg">{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
