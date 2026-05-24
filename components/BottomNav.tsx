'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutGrid, 
  FileText, 
  ChartPie, 
  Book, 
  Plus 
} from 'lucide-react';

const BottomNav = () => {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: LayoutGrid },
    { name: 'Assignments', href: '/assignments', icon: FileText },
    { name: 'Library', href: '/my-library', icon: ChartPie },
    { name: 'AI Toolkit', href: '/teacher-toolkit', icon: Book },
  ];

  return (
    <>
      {/* ➕ Floating White Add Action Button - Bottom Right */}
      <button 
        onClick={() => router.push('/create-assignment')}
        className="fixed bottom-24 right-6 w-12 h-12 rounded-full bg-white border border-zinc-200/80 shadow-2xl flex items-center justify-center text-brand-orange hover:bg-zinc-50 active:scale-90 transition-all z-40 lg:hidden cursor-pointer"
        title="Create New Assignment"
      >
        <Plus className="w-6 h-6 stroke-[3px]" />
      </button>

      {/* 🚀 Sleek Glassmorphic Floating Capsule Bottom Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-40 lg:hidden select-none">
        <nav className="bg-zinc-950/95 backdrop-blur-lg border border-zinc-800 shadow-2xl rounded-full px-5 py-2.5 flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));

            return (
              <Link 
                key={item.href} 
                href={item.href}
                className="flex flex-col items-center gap-1 transition-all group active:scale-95"
              >
                <div className={`p-1.5 rounded-xl transition-all ${
                  isActive ? 'text-brand-orange' : 'text-zinc-400 group-hover:text-zinc-200'
                }`}>
                  <Icon className="w-5 h-5 stroke-[2px]" />
                </div>
                <span className={`text-[9px] font-bold tracking-wide transition-all ${
                  isActive ? 'text-brand-orange font-black' : 'text-zinc-500 group-hover:text-zinc-300'
                }`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default BottomNav;
