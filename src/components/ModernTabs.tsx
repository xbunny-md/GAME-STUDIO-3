'use client';
import React from 'react';
import { motion } from 'motion/react';

interface Tab {
  id: string;
  label: string;
}

interface ModernTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export default function ModernTabs({ tabs, activeTab, onChange, className = '' }: ModernTabsProps) {
  return (
    <div className={`flex flex-wrap gap-2 p-1 glass rounded-2xl bg-white/5 border border-white/10 w-fit ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative px-4 py-2 rounded-xl font-bold transition-all text-sm outline-none ${
              isActive 
                ? 'text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="modern-tab-active"
                className="absolute inset-0 bg-cyan-500/20 border border-cyan-400/50 rounded-xl"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
