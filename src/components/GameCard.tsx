'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Game } from '../types';
import { motion } from 'motion/react';

interface GameCardProps {
  game: Game;
  key?: React.Key;
}

export default function GameCard({ game }: GameCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Link href={`/game/${game.slug}`}>
      <motion.div 
        whileHover={{ y: -5 }}
        className="glass rounded-2xl overflow-hidden glow-hover h-full flex flex-col group cursor-pointer bg-white/5 dark:bg-black/20"
      >
        <div className="relative aspect-video overflow-hidden">
          <img 
            src={game.data.image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop'} 
            alt={game.data.title}
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${isLoaded ? 'blur-0' : 'blur-md'}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-cyan-500/50 backdrop-blur-md border border-cyan-400/30">
              {game.data.category}
            </span>
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
            {game.data.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
            {game.data.description}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}
