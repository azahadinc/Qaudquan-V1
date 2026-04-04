'use client';

import React from 'react';
import { tokens } from '@/config/tokens';

export interface BadgeProps {
  label: string | number;
  variant?: 'up' | 'down' | 'neutral' | 'primary' | 'secondary';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'neutral', size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  const getBgColor = () => {
    switch (variant) {
      case 'up':
        return tokens.colors.up[600];
      case 'down':
        return tokens.colors.down[600];
      case 'primary':
        return tokens.colors.primary[600];
      case 'secondary':
        return tokens.colors.secondary[500];
      case 'neutral':
      default:
        return tokens.colors.neutral[200];
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'secondary':
        return tokens.colors.neutral[900];
      default:
        return '#ffffff';
    }
  };

  return (
    <span
      className={`
        rounded-full font-medium whitespace-nowrap
        ${sizeClasses[size]}
      `}
      style={{
        backgroundColor: getBgColor(),
        color: getTextColor(),
      }}
    >
      {label}
    </span>
  );
};
