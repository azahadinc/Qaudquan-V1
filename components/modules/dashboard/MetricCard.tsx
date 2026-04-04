'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useNumberTransition } from '@/hooks';
import { tokens } from '@/config/tokens';

export interface MetricCardProps {
  label: string;
  value: number;
  previousValue?: number;
  formatter?: (value: number) => string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number | string;
  subLabel?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  previousValue,
  formatter = (v) => v.toFixed(2),
  trend = 'neutral',
  trendValue,
  subLabel,
}: MetricCardProps) => {
  const animatedValue = useNumberTransition(value, 400);

  return (
    <Card className="flex flex-col justify-between">
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-text-secondary">{label}</p>
          {subLabel && <p className="text-xs text-text-tertiary mt-1">{subLabel}</p>}
        </div>
        {trend !== 'neutral' && (
          <Badge label={trendValue || `${trend === 'up' ? '+' : '-'}${Math.abs(Number(trendValue) || 0)}`} variant={trend} size="sm" />
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <h3
          className="text-3xl font-bold"
          style={{ color: tokens.colors.neutral[900] }}
        >
          {formatter(animatedValue)}
        </h3>
        {previousValue !== undefined && previousValue !== value && (
          <span
            className="text-sm font-medium"
            style={{ color: trend === 'up' ? tokens.colors.up[600] : tokens.colors.down[600] }}
          >
            {trend === 'up' ? '+' : ''}
            {formatter(value - previousValue)}
          </span>
        )}
      </div>
    </Card>
  );
};
