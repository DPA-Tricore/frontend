'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import SidebarNav from './sidebar-nav';
import SidebarUser from './sidebar-user';
import { APP_NAME } from '@/lib/constants/brand';
export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`border-r border-[var(--border)] text-primary min-h-screen flex flex-col transition-all duration-300 overflow-hidden ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="relative py-8 px-4 border-b border-primary flex items-center min-h-24">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 interactive icon-btn"
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          <Menu size={24} />
        </button>

        <div
          className={`absolute top-1/2 left-16 -translate-y-1/2 transition-opacity ${
            isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100 delay-300'
          }`}
        >
          <h1 className="text-2xl font-bold text-primary whitespace-nowrap">{APP_NAME}</h1>
        </div>
      </div>

      {/* Navigation */}
      <SidebarNav isCollapsed={isCollapsed} />

      {/* User Profile */}
      <SidebarUser isCollapsed={isCollapsed} />
    </aside>
  );
}
