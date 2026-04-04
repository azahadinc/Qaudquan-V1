'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

export interface AllocationDonutProps {
  allocations: Array<{ market: string; percentage: number; color: string }>;
}

export function AllocationDonut({ allocations }: AllocationDonutProps) {
  const totalPct = allocations.reduce((sum, allocation) => sum + allocation.percentage, 0);

  return (
    <Card className="flex flex-col items-center justify-between text-center">
      <div className="relative w-40 h-40 mb-6">
        <div className="absolute inset-0 rounded-full border-8 border-surface-tertiary" />
        <div className="absolute inset-5 rounded-full bg-surface-primary" />
        <div className="relative z-10 flex h-full w-full items-center justify-center rounded-full">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-text-secondary">Allocation</p>
            <p className="text-3xl font-bold">{Math.round(totalPct)}%</p>
          </div>
        </div>
      </div>

      <div className="w-full space-y-3">
        {allocations.map((allocation) => (
          <div key={allocation.market} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: allocation.color }}
              />
              <span>{allocation.market}</span>
            </div>
            <span className="font-semibold">{allocation.percentage.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
