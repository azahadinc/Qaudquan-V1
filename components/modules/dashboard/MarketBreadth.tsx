'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { tokens } from '@/config/tokens';

interface MarketBreadthProps {
  advancing: number;
  declining: number;
  unchanged: number;
}

export const MarketBreadth: React.FC<MarketBreadthProps> = ({
  advancing,
  declining,
  unchanged,
}: MarketBreadthProps) => {
  const total = advancing + declining + unchanged;
  const advancingPct = (advancing / total) * 100;
  const decliningPct = (declining / total) * 100;
  const unchangedPct = (unchanged / total) * 100;

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Market Breadth</h3>

      <div className="flex gap-2 mb-6 overflow-hidden rounded-lg border" style={{ borderColor: tokens.colors.surfaceVariant.border }}>
        <div
          className="h-2 transition-all duration-300"
          style={{ width: `${advancingPct}%`, backgroundColor: tokens.colors.up[600] }}
        />
        <div
          className="h-2 transition-all duration-300"
          style={{ width: `${unchangedPct}%`, backgroundColor: tokens.colors.neutral[200] }}
        />
        <div
          className="h-2 transition-all duration-300"
          style={{ width: `${decliningPct}%`, backgroundColor: tokens.colors.down[600] }}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-sm text-text-secondary mb-1">Advancing</p>
          <p className="text-2xl font-bold" style={{ color: tokens.colors.up[600] }}>
            {advancing}
          </p>
          <p className="text-xs text-text-secondary">{advancingPct.toFixed(1)}%</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-text-secondary mb-1">Unchanged</p>
          <p className="text-2xl font-bold text-text-secondary">{unchanged}</p>
          <p className="text-xs text-text-secondary">{unchangedPct.toFixed(1)}%</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-text-secondary mb-1">Declining</p>
          <p className="text-2xl font-bold" style={{ color: tokens.colors.down[600] }}>
            {declining}
          </p>
          <p className="text-xs text-text-secondary">{decliningPct.toFixed(1)}%</p>
        </div>
      </div>
    </Card>
  );
};
