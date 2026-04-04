'use client';

import { useState } from 'react';
import { tokens } from '@/config/tokens';

export function Topbar() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header
      className="fixed top-0 left-0 right-0 h-14 bg-surface-primary border-b border-surface-tertiary flex items-center justify-between px-6 z-50"
      style={{
        borderColor: tokens.colors.surfaceVariant.border,
        backgroundColor: tokens.colors.surface.bg,
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold">Qaudquan</h1>
        <span className="text-xs px-2 py-1 rounded-full bg-primary text-white opacity-75">
          v1.0
        </span>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-8">
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
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-status-up"></div>
          <span className="text-xs text-text-secondary">Live</span>
        </div>

        {/* Theme Toggle */}
        <button
          className="p-2 hover:bg-surface-secondary rounded-lg transition-colors"
          title="Toggle theme"
        >
          🌙
        </button>

        {/* User Menu */}
        <button className="p-2 hover:bg-surface-secondary rounded-lg transition-colors text-lg">
          👤
        </button>
      </div>
    </header>
  );
}
