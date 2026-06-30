'use client';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import GlassSelect from '../components/GlassSelect';

export default function Contact() {
  const { t } = useTranslation();
  const [method, setMethod] = useState<'whatsapp' | 'email'>('whatsapp');
  const [type, setType] = useState<'problem' | 'feedback'>('problem');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (method === 'whatsapp') {
      const waMessage = `*${type === 'problem' ? 'Report a Problem / Request Game' : 'General Feedback'}*\n\n*Name:* ${name}\n*Message:* ${message}`;
      window.open(`https://wa.me/255780470905?text=${encodeURIComponent(waMessage)}`, '_blank');
    } else {
      setLoading(true);
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            subject: type === 'problem' ? 'Report a Problem / Request Game' : 'General Feedback',
            message
          })
        });
        
        const data = await res.json();
        if (data.success) {
          toast.success('Message sent successfully!');
          setName('');
          setEmail('');
          setMessage('');
        } else {
          toast.error('Failed to send message.');
        }
      } catch (error) {
        toast.error('An error occurred.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 animate-in fade-in duration-500 pb-32">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-black glow-text mb-4">Contact Us</h1>
        <p className="text-gray-600 dark:text-gray-400">Get in touch with Lupin Starnley.</p>
      </div>

      <div className="glass p-6 md:p-8 rounded-3xl bg-white/5 dark:bg-black/20">
        <div className="flex bg-black/10 dark:bg-white/5 p-1 rounded-xl mb-8">
          <button
            onClick={() => setMethod('whatsapp')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg font-bold transition-all ${
              method === 'whatsapp' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <MessageCircle size={18} />
            <span>WhatsApp</span>
          </button>
          <button
            onClick={() => setMethod('email')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg font-bold transition-all ${
              method === 'email' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Mail size={18} />
            <span>Email</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 relative z-10">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Topic</label>
            <GlassSelect
              options={[
                { value: 'problem', label: 'Report a Problem / Request Game' },
                { value: 'feedback', label: 'General Feedback' }
              ]}
              value={type}
              onChange={(val) => setType(val as any)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full glass-dark dark:bg-black/30 bg-white/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-500 transition-colors text-gray-900 dark:text-white"
              placeholder="Your Name"
            />
          </div>

          {method === 'email' && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full glass-dark dark:bg-black/30 bg-white/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-500 transition-colors text-gray-900 dark:text-white"
                placeholder="your@email.com"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Message</label>
            <textarea 
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full glass-dark dark:bg-black/30 bg-white/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-500 transition-colors text-gray-900 dark:text-white resize-none"
              placeholder="How can we help?"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold flex items-center justify-center space-x-2 transition-all glow-hover disabled:opacity-50"
          >
            <span>{loading ? 'Sending...' : 'Send Message'}</span>
            {!loading && <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}
