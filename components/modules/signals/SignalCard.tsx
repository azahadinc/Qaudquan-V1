'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface KPIMetric {
  label: string;
  value: number;
  change: number;
}

interface SignalCardProps {
  kpi: KPIMetric;
}

export const SignalCard: React.FC<SignalCardProps> = ({ kpi }) => {
  const isPositive = kpi.change > 0;
  const changeSymbol = isPositive ? '+' : '';

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{kpi.label}</p>
          <p className="text-2xl font-bold">{kpi.value}</p>
        </div>
        <Badge label={`${changeSymbol}${kpi.change}`} variant={isPositive ? 'up' : 'down'} />
      </div>
    </Card>
  );
};