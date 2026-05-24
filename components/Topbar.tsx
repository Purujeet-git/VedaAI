'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Bell, Sparkles, Menu } from 'lucide-react';

interface TopbarProps {
  onMenuClick?: () => void;
}

const Topbar = ({ onMenuClick }: TopbarProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const [userProfile, setUserProfile] = useState<{ name: string; initials: string }>({
    name: 'Educator',
    initials: 'ED'
  });

  // Dynamic cookie utility to extract logged-in user details
  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  useEffect(() => {
    try {
      const sessionCookie = getCookie('veda_session');
      if (sessionCookie) {
        const decoded = JSON.parse(atob(decodeURIComponent(sessionCookie)));
        if (decoded && decoded.name) {
          const fullName = decoded.name;
          const names = fullName.trim().split(/\s+/);
          const initials = names.length >= 2 
            ? (names[0][0] + names[names.length - 1][0]).toUpperCase()
            : names[0].slice(0, 2).toUpperCase();
          
          setUserProfile({
            name: fullName,
            initials: initials
          });
        }
      }
    } catch (e) {
      console.error('Failed to parse user session in Topbar:', e);
    }
  }, []);

  // Generate page title/breadcrumb based on current URL
  const getPageContext = () => {
    if (pathname === '/dashboard') return { parent: 'Overview', active: 'Home' };
    if (pathname === '/assignments') return { parent: 'Curriculum', active: 'Assignments' };
    if (pathname?.startsWith('/assignments/')) return { parent: 'Assignments', active: 'View Question Paper' };
    if (pathname === '/create-assignment') return { parent: 'Assignments', active: 'Create Assignment' };
    if (pathname === '/my-groups') return { parent: 'Groups', active: 'My Classes' };
    if (pathname === '/teacher-toolkit') return { parent: 'AI Assistant', active: "Teacher's Toolkit" };
    if (pathname === '/my-library') return { parent: 'Storage', active: 'My Library' };
    return { parent: 'VedaAI', active: 'Educator Portal' };
  };

  const context = getPageContext();
  const showBackButton = pathname !== '/dashboard';

  return (
    <header className="sticky top-0 w-full h-[76px] flex items-center justify-between px-6 sm:px-8 bg-white/75 backdrop-blur-md border-b border-zinc-100/80 z-20 select-none">
      
      {/* Left: Breadcrumbs & Page title (Desktop only) */}
      <div className="hidden lg:flex items-center gap-4">
        {showBackButton && (
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-50 border border-zinc-100 hover:bg-zinc-100/80 hover:text-zinc-950 transition-all text-zinc-500 cursor-pointer active:scale-95"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5px]" />
          </button>
        )}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            <span>{context.parent}</span>
            <span className="text-zinc-300">/</span>
            <span className="text-brand-orange">{context.active}</span>
          </div>
          <h2 className="text-base font-extrabold text-zinc-900 leading-tight mt-0.5">
            {pathname === '/dashboard' ? 'Welcome, Educator' : context.active}
          </h2>
        </div>
      </div>

      {/* Left: Mobile Logo Brand (Mobile only) */}
      <div className="flex lg:hidden items-center gap-3">
        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-zinc-100 bg-zinc-50 flex items-center justify-center">
          <Image 
            src="/logo.avif" 
            alt="VedaAI Logo" 
            width={28} 
            height={28} 
            className="object-cover"
          />
        </div>
        <span className="font-extrabold text-base tracking-tight text-zinc-900 select-none">VedaAI</span>
      </div>
 
      {/* Right: Quick actions, notifications, user avatar */}
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* Quick Action Button (Desktop only) */}
        <button 
          onClick={() => router.push('/create-assignment')}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 text-white font-semibold text-xs tracking-wide shadow-sm hover:bg-zinc-900 transition-all cursor-pointer active:scale-95 border border-zinc-800"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
          Create New
        </button>
 
        {/* Notification Bell */}
        <button className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-50 border border-zinc-100 hover:bg-zinc-100/80 transition-colors text-zinc-500 hover:text-zinc-900 cursor-pointer group">
          <Bell className="w-4.5 h-4.5 stroke-[2px] transition-transform group-hover:rotate-6" />
          {/* Active notification badge indicator */}
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-brand-orange ring-2 ring-white animate-pulse"></span>
        </button>
 
        {/* Divider (Desktop only) */}
        <div className="hidden md:block h-6 w-px bg-zinc-100"></div>
 
        {/* Profile Card */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end hidden md:flex">
            <span className="text-xs font-bold text-zinc-800 leading-tight">{userProfile.name}</span>
            <span className="text-[10px] font-medium text-emerald-500 mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
            </span>
          </div>
          
          <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-brand-orange/20 bg-brand-orange-light flex items-center justify-center font-bold text-sm text-brand-orange uppercase">
            {userProfile.initials}
          </div>
        </div>

        {/* Mobile Hamburger Drawer Menu Button (Mobile only) */}
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-50 border border-zinc-100 hover:bg-zinc-100/80 transition-all text-zinc-500 hover:text-zinc-900 cursor-pointer active:scale-90"
            title="Open Navigation"
          >
            <Menu className="w-5 h-5 stroke-[2.5px]" />
          </button>
        )}
 
      </div>

    </header>
  );
};

export default Topbar;