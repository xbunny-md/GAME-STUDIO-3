'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import { Menu, X, Home, Info, Mail, Shield, Moon, Sun, Monitor, Globe, Heart, LogIn, LogOut, User, FileText, Trophy, Folder } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

interface SidebarProps {
  onFilterChange?: (category: string) => void;
  currentCategory?: string;
}

export default function Sidebar({ onFilterChange, currentCategory }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        if (['qbotmanager@gmail.com', 'lupinstarnley009@gmail.com'].includes(session.user.email)) {
          setIsAdmin(true);
        } else {
          const { data } = await supabase.from('profiles').select('is_admin').eq('id', session.user.id).single();
          setIsAdmin(!!data?.is_admin);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        if (['qbotmanager@gmail.com', 'lupinstarnley009@gmail.com'].includes(session.user.email)) {
          setIsAdmin(true);
        } else {
          const { data } = await supabase.from('profiles').select('is_admin').eq('id', session.user.id).single();
          setIsAdmin(!!data?.is_admin);
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  const categories = ['All', 'Android', 'PC', 'PlayStation', 'PPSSPP', 'iOS'];
  
  const navLinks = [
    { name: 'Home', path: '/', icon: <Home size={20} /> },
    { name: '🏆 Leaderboard', path: '/leaderboard', icon: <Trophy size={20} /> },
    { name: 'My Collections', path: '/collections', icon: <Folder size={20} /> },
    { name: 'Blog', path: '/blog', icon: <FileText size={20} /> },
    { name: 'Wishlist', path: '/wishlist', icon: <Heart size={20} /> },
    { name: 'About', path: '/about', icon: <Info size={20} /> },
    { name: 'Contact', path: '/contact', icon: <Mail size={20} /> },
    ...(isAdmin ? [{ name: 'Admin', path: '/admin', icon: <Shield size={20} /> }] : []),
  ];

  const handleRequestGame = () => {
    window.location.href = "mailto:lupinstarnley009@gmail.com?subject=Game Request";
  };

  const handleCategoryClick = (cat: string) => {
    if (onFilterChange) onFilterChange(cat);
    setIsOpen(false);
  };

  return (
    <>
      <button 
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 glass rounded-full text-black dark:text-white glow-hover md:hidden bg-gray-100/50 dark:bg-black/50"
      >
        <Menu size={24} />
      </button>

      {/* Desktop Sidebar (Always open) & Mobile Sidebar */}
      <AnimatePresence>
        <motion.div
          className={`fixed inset-y-0 left-0 z-40 w-64 glass-dark text-black dark:text-white flex flex-col md:translate-x-0 transition-transform duration-300
            ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        >
          <div className="p-6 flex items-center justify-between">
            <h1 className="text-2xl font-black tracking-widest glow-text">GAME STUDIO</h1>
            <button onClick={toggleSidebar} className="md:hidden">
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
            {navLinks.map((link) => {
              // Using pathname hook is better but to avoid importing, simple fallback:
              return (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/10`}
              >
                {link.icon}
                <span className="font-medium">{t(link.name)}</span>
              </Link>
              );
            })}

              <button
                onClick={handleRequestGame}
                className="w-full flex items-center space-x-3 p-3 mt-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left"
              >
                <Mail size={20} />
                <span className="font-medium">📩 Request Game</span>
              </button>

              <div className="mt-8 mb-4">
                <h3 className="text-xs uppercase text-gray-500 font-bold px-3 mb-2">{t('Account')}</h3>
                <div className="space-y-2 px-2">
                  {user ? (
                    <>
                      <div className="px-4 py-2 text-sm font-medium text-cyan-500 flex items-center space-x-2 truncate">
                        <User size={16} className="shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-red-400 hover:text-red-300"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setIsOpen(false)}
                        className="w-full flex justify-center px-4 py-2 rounded-xl text-sm font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white"
                      >
                        Login
                      </Link>
                      <Link
                        href="/login"
                        onClick={() => setIsOpen(false)}
                        className="w-full flex justify-center px-4 py-2 rounded-xl text-sm font-bold bg-cyan-500 shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:bg-cyan-400 transition-colors text-white"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-8 mb-4">
                <h3 className="text-xs uppercase text-gray-500 font-bold px-3 mb-2">{t('Filters')}</h3>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryClick(cat)}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        currentCategory === cat || (cat === 'All' && !currentCategory)
                          ? 'bg-cyan-500/20 text-cyan-500 shadow-[0_0_10px_rgba(0,255,255,0.2)]' 
                          : 'hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {t(cat)}
                    </button>
                  ))}
                </div>
              </div>
            </nav>

            <div className="p-4 border-t border-black/10 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                  <Globe size={16} />
                  <span>{t('Language')}</span>
                </div>
                <button 
                  onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'sw' : 'en')}
                  className="px-3 py-1 rounded-md bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-xs font-bold transition-colors"
                >
                  {i18n.language?.toUpperCase() || 'EN'}
                </button>
              </div>
              
              <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-lg">
                <button onClick={() => setTheme('light')} className={`flex-1 flex justify-center py-2 rounded-md transition-colors ${theme === 'light' ? 'bg-white shadow-sm text-cyan-500' : 'text-gray-500'}`}>
                  <Sun size={16} />
                </button>
                <button onClick={() => setTheme('dark')} className={`flex-1 flex justify-center py-2 rounded-md transition-colors ${theme === 'dark' ? 'bg-black/50 shadow-sm text-cyan-500' : 'text-gray-500'}`}>
                  <Moon size={16} />
                </button>
                <button onClick={() => setTheme('system')} className={`flex-1 flex justify-center py-2 rounded-md transition-colors ${theme === 'system' ? 'bg-white dark:bg-black/50 shadow-sm text-cyan-500' : 'text-gray-500'}`}>
                  <Monitor size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
