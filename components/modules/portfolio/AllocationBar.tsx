'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

export interface AllocationDatum {
  market: string;
  value: number;
  percentage: number;
  color: string;
}

interface AllocationBarProps {
  allocations: AllocationDatum[];
}

export function AllocationBar({ allocations }: AllocationBarProps) {
  const totalValue = allocations.reduce((sum, allocation) => sum + allocation.value, 0);

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Allocation Breakdown</h2>
          <p className="text-sm text-text-secondary">Current portfolio allocation by market</p>
        </div>
        <span className="text-sm text-text-secondary">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
      </div>

      <div className="space-y-4">
        {allocations.map((allocation) => (
          <div key={allocation.market} className="space-y-2">
            <div className="flex items-center justify-between text-sm font-medium text-text-secondary">
              <span>{allocation.market}</span>
              <span>{allocation.percentage.toFixed(1)}%</span>
            </div>
            <div className="h-3 rounded-full bg-surface-tertiary overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${allocation.percentage}%`, backgroundColor: allocation.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
