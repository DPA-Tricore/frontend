// Protected layout — shared shell for all authenticated routes (leads, tasks, reminders, dashboard).
// Handles auth guard, sidebar, header, and page transition animation.
'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/sidebar/sidebar';
import Header from '@/components/header';
import LoadingSpinner from '@/components/loading-spinner';
import SearchPalette from '@/components/search/SearchPalette';
import ChatSidebar from '@/components/ai/ChatSidebar';
import { useCommandPalette } from '@/lib/hooks/useCommandPalette';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isOpen: isPaletteOpen, open: openPalette, close: closePalette } = useCommandPalette();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Keep the spinner up while redirecting, so a signed-out visit never flashes a blank page.
  if (isLoading || !isAuthenticated) return <LoadingSpinner fullPage />;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} onSearchOpen={openPalette} />
        <SearchPalette isOpen={isPaletteOpen} onClose={closePalette} />
        <main className="flex-1 overflow-auto">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {children}
          </motion.div>
        </main>
      </div>
      <ChatSidebar />
    </div>
  );
}
