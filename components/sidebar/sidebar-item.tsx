'use client';

import Link from 'next/link';
import React from 'react';

interface SidebarItemProps {
  name: string;
  icon: React.ElementType;
  href?: string;
  isActive: boolean;
  isCollapsed: boolean;
}

export default function SidebarItem({
  name,
  icon: Icon,
  href,
  isActive,
  isCollapsed,
}: SidebarItemProps) {
  const sharedClass = `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors w-full text-left ${
    isActive ? 'bg-blue-600 text-white' : 'text-muted interactive'
  }`;

  const label = (
    <>
      <Icon size={20} className="flex-shrink-0" />
      <span
        className={`font-medium transition-opacity duration-300 ${
          isCollapsed ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {name}
      </span>
    </>
  );

  return href ? (
    <Link
      href={href}
      className={sharedClass}
      title={isCollapsed ? name : ''}
    >
      {label}
    </Link>
  ) : (
    <button
      type="button"
      className={sharedClass}
      title={isCollapsed ? name : ''}
    >
      {label}
    </button>
  );
}
