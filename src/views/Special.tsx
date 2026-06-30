'use client';
import React, { useState } from 'react';
import GlassModal from '../components/GlassModal';

export default function Special() {
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !amount) return;
    setShowConfirm(true);
  };

  const handleWhatsApp = () => {
    const text = `Proof of payment. Amount: ${amount} TZS. Sent to: 255747470941. Name: Lupin Starnley`;
    window.open(`https://wa.me/255780470905?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleEmail = () => {
    const subject = `Payment Proof ${amount} TZS`;
    const body = `Hello, I sent ${amount} TZS to 255747470941. Name: Lupin Starnley.\r\n`;
    window.location.href = `mailto:lupinstarnley009@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}&cc=lupinstarnley009@gmail.com`;
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-20 animate-in fade-in duration-500 flex items-center justify-center">
      <div className="w-full max-w-md glass p-8 md:p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_0_50px_rgba(0,255,255,0.1)]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-cyan-500 glow-text mb-2">Buy Me Coffee</h1>
          <p className="text-gray-400">Support GAMES STUDIO</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-300">Phone Number</label>
            <input 
              type="text" 
              required 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full glass-dark rounded-xl px-4 py-3 outline-none focus:border-cyan-500 text-white border border-white/10 transition-colors"
              placeholder="+255..."
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-300">Amount (TZS)</label>
            <input 
              type="number" 
              required 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full glass-dark rounded-xl px-4 py-3 outline-none focus:border-cyan-500 text-white border border-white/10 transition-colors"
              placeholder="1000"
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold transition-all shadow-[0_0_15px_rgba(0,255,255,0.3)] glow-hover"
          >
            Support Us
          </button>
        </form>
      </div>

      <GlassModal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Payment">
        <div className="text-center space-y-6">
          <div className="glass p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <p className="text-gray-300 mb-2">Payment number</p>
            <p className="text-2xl font-bold text-cyan-500">255747470941</p>
            <p className="text-gray-300 mt-4 mb-2">Name</p>
            <p className="text-xl font-bold text-white">Lupin Starnley</p>
            <p className="text-gray-300 mt-4 mb-2">Amount (TZS)</p>
            <p className="text-xl font-bold text-white">{amount}</p>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={handleWhatsApp}
              className="w-full py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-[#25D366] hover:border-[#25D366] text-white font-bold transition-all backdrop-blur-xl shadow-[0_0_15px_rgba(37,211,102,0.1)] hover:shadow-[0_0_20px_rgba(37,211,102,0.4)]"
            >
              Send via WhatsApp
            </button>
            <button 
              onClick={handleEmail}
              className="w-full py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-cyan-500 hover:border-cyan-500 text-white font-bold transition-all backdrop-blur-xl shadow-[0_0_15px_rgba(0,255,255,0.1)] hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]"
            >
              Send via Email
            </button>
          </div>
        </div>
      </GlassModal>
    </div>
  );
}
