'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { tokens } from '@/config/tokens';

interface Mover {
  symbol: string;
  name: string;
  changePct: number;
  price: number;
}

interface TopMoversProps {
  gainers: Mover[];
  losers: Mover[];
}

export const TopMovers: React.FC<TopMoversProps> = ({ gainers, losers }: TopMoversProps) => {
  const renderMoversList = (items: Mover[], isUp: boolean) => (
    <div className="space-y-2">
      {items.slice(0, 5).map((item) => (
        <div key={item.symbol} className="flex items-center justify-between p-2 hover:bg-surface-tertiary rounded transition-colors">
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-semibold text-sm text-text-primary">{item.symbol}</span>
            <span className="text-xs text-text-secondary truncate">{item.name}</span>
          </div>
          <div className="flex flex-col items-end gap-1 ml-2">
            <span className="text-sm font-mono">${item.price.toFixed(2)}</span>
            <Badge label={`${isUp ? '+' : ''}${item.changePct.toFixed(2)}%`} variant={isUp ? 'up' : 'down'} size="sm" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Top Movers</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tokens.colors.up[600] }} />
            Top Gainers
          </h4>
          {renderMoversList(gainers, true)}
        </div>

        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tokens.colors.down[600] }} />
            Top Losers
          </h4>
          {renderMoversList(losers, false)}
        </div>
      </div>
    </Card>
  );
};
