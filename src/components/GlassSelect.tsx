'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface GlassSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

export default function GlassSelect({ options, value, onChange }: GlassSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 glass rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-bold text-gray-200 shadow-[0_0_15px_rgba(0,255,255,0.05)] w-full justify-between min-w-[120px]"
      >
        <span>{selectedOption.label}</span>
        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full glass rounded-xl bg-black/50 backdrop-blur-xl border border-white/10 overflow-hidden z-20 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm font-bold transition-colors ${
                option.value === value 
                  ? 'bg-cyan-500/20 text-cyan-400' 
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
