import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Gamepad2, FileText, MessageSquare, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    router.push('/');
  };

  const navItems = [
    { href: '/ad/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { href: '/ad/users', label: 'Users', icon: <Users size={20} /> },
    { href: '/ad/games', label: 'Games', icon: <Gamepad2 size={20} /> },
    { href: '/ad/posts', label: 'Posts', icon: <FileText size={20} /> },
    { href: '/ad/comments', label: 'Comments', icon: <MessageSquare size={20} /> },
  ];

  return (
    <div className="w-64 h-screen sticky top-0 flex flex-col glass bg-white/50 dark:bg-black/40 backdrop-blur-xl border-r border-black/10 dark:border-white/10 p-6 z-40 transition-colors">
      <div className="mb-10">
        <h2 className="text-2xl font-black text-cyan-500 glow-text drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">ADMIN PANEL</h2>
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-bold ${
                isActive 
                  ? 'bg-cyan-500/20 text-cyan-500 dark:text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.2)]' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="pt-6 border-t border-black/10 dark:border-white/10 mt-auto">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/20 transition-colors font-bold"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
