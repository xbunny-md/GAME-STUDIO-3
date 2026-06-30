'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 animate-in fade-in duration-500 space-y-12 pb-32">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-widest glow-text mb-6">
          GAME STUDIO
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">
          {t('A hub for PC, Android, PlayStation, PPSSPP, iOS game repacks.')}
        </p>
      </div>

      <div className="grid gap-8">
        <div className="glass p-8 md:p-10 rounded-3xl glow-hover">
          <h2 className="text-2xl font-bold text-cyan-500 mb-4">Who We Are</h2>
          <div className="space-y-4 text-gray-800 dark:text-gray-300 leading-relaxed">
            <p>
              GAME STUDIO is a premier project created by Lupin Starnley, designed to be the ultimate hub for gamers worldwide. Our mission is to provide top-tier gaming experiences across multiple platforms, ensuring that every player has access to the best titles without unnecessary hurdles. We believe in the power of gaming to connect people, tell incredible stories, and provide unforgettable adventures.
            </p>
            <p>
              With a deep passion for the gaming community, Lupin Starnley has curated a collection that bridges the gap between classic nostalgia and modern masterpieces. Whether you are a hardcore PC enthusiast or a casual mobile gamer, our platform is built from the ground up to serve your needs with dedication, quality, and a user-first approach.
            </p>
          </div>
        </div>

        <div className="glass p-8 md:p-10 rounded-3xl glow-hover">
          <h2 className="text-2xl font-bold text-cyan-500 mb-4">What We Offer</h2>
          <div className="space-y-4 text-gray-800 dark:text-gray-300 leading-relaxed">
            <p><strong>PC Repacks:</strong> Highly compressed, fully functional PC games with simple installation processes, saving your bandwidth and time.</p>
            <p><strong>Android & iOS:</strong> The best mobile ports and native games optimized for touchscreens, bringing console-quality experiences to your pocket.</p>
            <p><strong>PlayStation & PPSSPP:</strong> A massive library of classic PlayStation and PSP titles, ready to be played on your favorite emulators with enhanced graphics and performance.</p>
          </div>
        </div>

        <div className="glass p-8 md:p-10 rounded-3xl glow-hover">
          <h2 className="text-2xl font-bold text-cyan-500 mb-4">Our Promise</h2>
          <div className="space-y-4 text-gray-800 dark:text-gray-300 leading-relaxed">
            <p>
              Safety and convenience are at the core of everything we do. We promise that every game hosted on GAME STUDIO is thoroughly tested and verified to be safe from malware and intrusive software. Your security is our top priority, and we maintain a clean environment so you can download with absolute confidence.
            </p>
            <p>
              Furthermore, we guarantee a completely ad-free experience. No more clicking through endless pop-ups or fake download buttons. We utilize fast, direct 1DM links to ensure your downloads are swift and reliable, giving you more time to play and less time waiting. We respect our users and are committed to delivering the highest standard of service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
