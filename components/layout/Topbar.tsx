'use client';

import { useState } from 'react';
import { useConnectionStatus } from '../../hooks/useConnectionStatus';
import { useNavStore } from '@/lib/store/navStore';
import { ConnectionStatusDrawer } from './ConnectionStatusDrawer';
import { tokens } from '@/config/tokens';

export function Topbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showStatusDrawer, setShowStatusDrawer] = useState(false);
  const overallStatus = useConnectionStatus();
  const { toggleSidebar } = useNavStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500 animate-pulse';
      case 'reconnecting': return 'bg-orange-500 animate-pulse';
      case 'error': return 'bg-red-500';
      case 'degraded': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Live';
      case 'connecting': return 'Connecting...';
      case 'reconnecting': return 'Reconnecting...';
      case 'error': return 'Offline';
      case 'degraded': return 'Degraded';
      default: return 'Unknown';
    }
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 h-14 bg-surface-primary border-b border-surface-tertiary flex items-center justify-between px-4 sm:px-6 z-50"
        style={{
          borderColor: tokens.colors.surfaceVariant.border,
          backgroundColor: tokens.colors.surface.bg,
        }}
      >
        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-lg hover:bg-surface-tertiary lg:hidden"
            title="Open sidebar"
            onClick={toggleSidebar}
          >
            <i className="lni lni-menu"></i>
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Qaudquan Logo" className="h-8 w-auto" />
            <span className="text-xs px-2 py-1 rounded-full bg-primary text-white opacity-75">
              v1.0
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <input
            type="text"
            placeholder="Search symbols..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-surface-secondary border border-surface-tertiary focus:outline-none focus:border-primary transition-colors text-sm"
            style={{
              backgroundColor: tokens.colors.surface.variant,
              borderColor: tokens.colors.surfaceVariant.border,
            }}
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Status Indicator */}
          <button
            onClick={() => setShowStatusDrawer(true)}
            className="flex items-center gap-2 hover:bg-surface-secondary rounded-lg px-3 py-2 transition-colors"
            title="Connection status"
          >
            <div className={`w-2 h-2 rounded-full ${getStatusColor(overallStatus)}`}></div>
            <span className="text-xs text-text-secondary">{getStatusText(overallStatus)}</span>
          </button>

          {/* Theme Toggle */}
          <button
            className="p-2 hover:bg-surface-secondary rounded-lg transition-colors"
            title="Toggle theme"
          >
            <i className="lni lni-moon"></i>
          </button>

          {/* User Menu */}
          <button className="p-2 hover:bg-surface-secondary rounded-lg transition-colors text-lg">
            <i className="lni lni-user"></i>
          </button>
        </div>
      </header>

      <ConnectionStatusDrawer
        isOpen={showStatusDrawer}
        onClose={() => setShowStatusDrawer(false)}
      />
    </>
  );
}
