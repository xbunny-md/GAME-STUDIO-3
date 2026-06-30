'use client';
import React from 'react';
import { Download } from 'lucide-react';

export default function RecommendedApps() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-white glow-text mb-4">Recommended Apps</h1>
        <p className="text-gray-400">Essential applications for the best gaming and downloading experience.</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <a 
          href="https://play.google.com/store/apps/details?id=idm.internet.download.manager&pli=1"
          target="_blank"
          rel="noopener noreferrer"
          className="block p-6 md:p-8 rounded-3xl glass bg-white/5 border border-white/10 hover:bg-white/10 transition-all group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-4 rounded-2xl bg-cyan-500/20 text-cyan-500 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                <Download size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">1DM: Browser & Download Manager</h2>
                <p className="text-cyan-500 font-medium">Must-Have for Large Games</p>
              </div>
            </div>

            <div className="space-y-4 text-gray-300 leading-relaxed mb-8">
              <p>
                <strong className="text-white">Why every gamer needs this:</strong> Game Studio offers large 50GB+ PC and console games. Standard mobile browsers often fail, timeout, or corrupt these massive files midway, wasting your precious mobile data.
              </p>
              <p>
                <strong className="text-white">The Solution:</strong> 1DM uses advanced multi-threaded downloading to accelerate speeds up to 10x. It guarantees stable downloads with full Pause and Resume support.
              </p>
              <p>
                <strong className="text-white">How to use:</strong> Simply copy any game download link from our site (like GDrive, Mega, or 1Fichier) and paste it directly into 1DM. It handles background downloading perfectly so you can close the app while your game downloads safely.
              </p>
              <p>
                <strong className="text-white">Key Features:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Multi-threaded downloading for 10x speed</li>
                <li>Pause and Resume downloads without corruption</li>
                <li>Schedule downloads</li>
                <li>Background downloading</li>
                <li>No size limits for big 50GB+ games</li>
                <li>Supports GDrive, Mega, 1Fichier links</li>
              </ul>
            </div>

            <div className="inline-block px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold transition-all shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:shadow-[0_0_30px_rgba(0,255,255,0.6)] text-center">
              Get 1DM Free on Google Play
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
