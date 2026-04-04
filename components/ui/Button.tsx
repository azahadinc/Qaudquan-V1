'use client';

import React from 'react';
import { tokens } from '@/config/tokens';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', ...props }, ref) => {
    const sizeClasses = {
      sm: 'px-3 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    const variantClasses = {
      primary: 'bg-primary text-white hover:opacity-90',
      secondary: 'bg-surface-secondary text-text-primary hover:opacity-80',
      danger: 'bg-status-down text-white hover:opacity-90',
      ghost: 'bg-transparent text-text-primary hover:bg-surface-secondary',
    };

    return (
      <button
        ref={ref}
        className={`
          rounded-lg font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeClasses[size]} ${variantClasses[variant]} ${className}
        `}
        style={{
          backgroundColor: variant === 'primary' ? tokens.colors.primary[600] : undefined,
        } as React.CSSProperties}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
