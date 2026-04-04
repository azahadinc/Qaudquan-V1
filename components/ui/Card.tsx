'use client';

import React from 'react';
import { tokens } from '@/config/tokens';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'highlighted';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  variant = 'default',
}: CardProps) => {
  return (
    <div
      className={`
        rounded-xl border p-6 transition-all duration-200
        ${variant === 'highlighted' ? 'border-primary shadow-lg' : 'border-surface-tertiary hover:shadow-md'}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        backgroundColor: tokens.colors.surface.variant,
        borderColor: tokens.colors.surfaceVariant.border,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
