'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutGrid, 
  UserRound, 
  FileText, 
  Book, 
  ChartPie, 
  Settings,
  LogOut,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ isOpen = false, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (res.ok) {
        router.refresh();
        router.push('/login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: LayoutGrid },
    { name: 'My Groups', href: '/my-groups', icon: UserRound },
    { name: 'Assignments', href: '/assignments', icon: FileText, badge: 22 },
    { name: "AI Teacher's Toolkit", href: '/teacher-toolkit', icon: Book },
    { name: 'My Library', href: '/my-library', icon: ChartPie },
  ];

  return (
    <>
      {/* 🌫️ Mobile Sidebar Glassmorphic Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-zinc-950/45 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
        />
      )}

      {/* 🧭 Sliding Responsive Sidebar Container */}
      <aside className={`fixed inset-y-0 left-0 w-72 h-screen flex flex-col justify-between bg-white border-r border-zinc-100 px-6 py-8 flex-shrink-0 z-50 select-none transition-transform duration-300 ease-out lg:static lg:translate-x-0 ${
        isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}>
        
        {/* Upper Content Group */}
        <div className="flex flex-col flex-1">
          
          {/* Brand/Logo Header with Mobile Close Action */}
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-4">
              <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-sm border border-zinc-100 bg-zinc-50 flex items-center justify-center">
                <Image 
                  src="/logo.avif" 
                  alt="VedaAI Logo" 
                  width={40} 
                  height={40} 
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-zinc-900">VedaAI</h1>
                <p className="text-[10px] font-semibold tracking-wider text-brand-orange uppercase">Educator Hub</p>
              </div>
            </div>

            {/* Mobile Close Icon Button */}
            {onClose && (
              <button 
                onClick={onClose}
                className="lg:hidden p-2 rounded-xl hover:bg-zinc-50 border border-transparent hover:border-zinc-100 text-zinc-400 hover:text-zinc-700 transition-all cursor-pointer active:scale-90"
                title="Close Sidebar"
              >
                <X className="w-5 h-5 stroke-[2.5px]" />
              </button>
            )}
          </div>

        {/* Create Assignment Button (Figma styled) */}
        <Link 
          href="/create-assignment"
          className="relative w-full overflow-hidden rounded-full py-3 px-4 mb-8 bg-zinc-950 text-white font-bold text-xs tracking-wide shadow-md hover:bg-zinc-900 transition-all flex items-center justify-center gap-2 group border border-brand-orange/60 hover:border-brand-orange active:scale-95 text-center cursor-pointer select-none"
        >
          {/* Subtle Glow Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          <span className="text-brand-orange font-extrabold text-sm">+</span>
          <span className="font-bold text-zinc-100 group-hover:text-brand-orange transition-colors">Create Assignment</span>
        </Link>

        {/* Navigation Menu */}
        <nav className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Check if active. We check exact or prefix to support subpages
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-brand-orange-light text-brand-orange shadow-sm shadow-brand-orange/5'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <Icon className={`w-[18px] h-[18px] transition-colors ${
                  isActive 
                    ? 'text-brand-orange' 
                    : 'text-zinc-400 group-hover:text-zinc-700'
                }`} />
                <span>{item.name}</span>
                {item.badge && (
                  <span className={`ml-2.5 px-2 py-0.5 rounded-full text-[9px] font-black leading-none ${
                    isActive ? 'bg-brand-orange text-white' : 'bg-brand-orange-light text-brand-orange border border-brand-orange/10'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <div className="ml-auto w-1 h-4 rounded-full bg-brand-orange"></div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Content Group (Settings & Profile) */}
      <div className="flex flex-col gap-6 pt-6 border-t border-zinc-100">
        
        {/* Settings button */}
        <Link
          href="/settings"
          className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 group ${
            pathname === '/settings'
              ? 'bg-brand-orange-light text-brand-orange'
              : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
          }`}
        >
          <Settings className={`w-[18px] h-[18px] transition-colors ${
            pathname === '/settings' ? 'text-brand-orange' : 'text-zinc-400 group-hover:text-zinc-700'
          }`} />
          <span>Settings</span>
        </Link>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 text-zinc-500 hover:bg-red-50 hover:text-red-600 group w-full cursor-pointer text-left"
        >
          <LogOut className="w-[18px] h-[18px] text-zinc-400 group-hover:text-red-500 transition-colors" />
          <span>Log Out</span>
        </button>

        {/* Institution details panel */}
        <div className="flex items-center gap-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl p-4">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-white shadow-inner flex items-center justify-center">
            <Image 
              src="/School_logo.jpg" 
              alt="School Logo" 
              width={34} 
              height={34}
              className="object-contain"
            />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-zinc-800 truncate leading-tight">Delhi Public School</h4>
            <p className="text-[10px] text-zinc-400 font-medium truncate mt-0.5">Bokaro Steel City</p>
          </div>
        </div>

      </div>

    </aside>
    </>
  );
};

export default Sidebar;