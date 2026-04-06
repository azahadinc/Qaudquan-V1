'use client';

import { ReactNode } from 'react';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import { useNavStore } from '@/lib/store/navStore';

interface PageShellProps {
  children: ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  const { isCollapsed } = useNavStore();

  return (
    <div className="flex flex-col h-screen bg-surface-primary text-text-primary">
      {/* Topbar */}
      <Topbar />

      {/* Main Content with Sidebar */}
      <div className="flex flex-1 overflow-hidden pt-14">
        {/* Sidebar */}
        <Sidebar />

        {/* Page Content */}
        <main
          className={`
            flex-1 overflow-y-auto transition-all duration-300 ease-in-out
            ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'} ml-0
          `}
        >
          <div className="p-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
