'use client';
import { useState } from 'react';
import Sidebar from '../src/components/Sidebar';
import Link from 'next/link';
import { ThemeProvider } from 'next-themes';
import '../src/i18n';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [currentCategory, setCurrentCategory] = useState('All');

  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-black dark:text-white transition-colors duration-300">
        <Sidebar onFilterChange={setCurrentCategory} currentCategory={currentCategory} />
        
        <main className="md:ml-64 min-h-screen relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
          </div>

          {children}
        </main>
        
        <div className="fixed bottom-6 right-6 z-50">
          <Link href="/special" className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold transition-all shadow-[0_0_15px_rgba(0,255,255,0.3)] glow-hover border border-cyan-400/50 backdrop-blur-xl">
            <span>☕ Support Us</span>
          </Link>
        </div>
      </div>
    </ThemeProvider>
  );
}
