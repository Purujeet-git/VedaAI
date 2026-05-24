'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import BottomNav from '@/components/BottomNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#fafafc] overflow-hidden">
      {/* Sidebar - responsive sliding drawer overlay */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        {/* Sticky Topbar with hamburger trigger */}
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Main page content scrollable */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 pb-32 lg:pb-12 pt-6 relative">
          {children}
        </main>

        {/* Mobile Bottom Capsule Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}
