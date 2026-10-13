'use client';

import Link from 'next/link';
import React from 'react';

interface SidebarItemProps {
  name: string;
  icon: React.ElementType;
  href: string;
  isActive: boolean;
  isCollapsed: boolean;
}

// The icon never moves: padding is fixed and the label fades while the
// sidebar's width slides, so collapsing reads as one smooth motion.
export default function SidebarItem({ name, icon: Icon, href, isActive, isCollapsed }: SidebarItemProps) {
  return (
    <Link
      href={href}
      title={isCollapsed ? name : undefined}
      aria-current={isActive ? 'page' : undefined}
      className={`flex items-center gap-3 h-9 px-3 rounded-md text-sm whitespace-nowrap transition-colors duration-150 ${
        isActive
          ? 'bg-[var(--surface-2)] text-[var(--fg)] font-medium'
          : 'text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--fg)]'
      }`}
    >
      <Icon
        size={18}
        className={`flex-shrink-0 transition-colors duration-150 ${isActive ? 'text-[var(--accent)]' : ''}`}
      />
      <span
        className={`truncate transition-opacity duration-200 ${
          isCollapsed ? 'opacity-0' : 'opacity-100 delay-75'
        }`}
      >
        {name}
      </span>
    </Link>
  );
}
