'use client';
import React from 'react';
import { X } from 'lucide-react';

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function GlassModal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }: GlassModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xl overflow-y-auto">
      <div className={`glass p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 w-full ${maxWidth} shadow-[0_0_50px_rgba(0,255,255,0.1)] relative animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col`}>
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4 shrink-0">
          <h2 className="text-xl font-bold text-white glow-text">{title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-xl"
          >
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto shrink overflow-x-hidden p-1">
          {children}
        </div>
      </div>
    </div>
  );
}
