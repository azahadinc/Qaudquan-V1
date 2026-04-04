'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { tokens } from '@/config/tokens';

interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  sparkline: number[];
}

interface WatchlistProps {
  items: WatchlistItem[];
  onRemove?: (symbol: string) => void;
}

export const Watchlist: React.FC<WatchlistProps> = ({ items, onRemove }: WatchlistProps) => {
  const [hoveredSymbol, setHoveredSymbol] = useState<string | null>(null);

  const renderSparkline = (data: number[]) => {
    if (data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const h = 24;
    const w = 40;

    const points = data.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    });

    const isUp = data[data.length - 1] >= data[0];

    return (
      <svg width={w + 4} height={h + 4} viewBox={`0 0 ${w} ${h}`} className="inline">
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke={isUp ? tokens.colors.up[600] : tokens.colors.down[600]}
          strokeWidth="1.5"
        />
      </svg>
    );
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Watchlist</h3>
        <span className="text-sm text-text-secondary">{items.length} symbols</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr
              className="border-b"
              style={{ borderColor: tokens.colors.surfaceVariant.border }}
            >
              <th className="text-left py-2 px-3 font-medium text-text-secondary">Symbol</th>
              <th className="text-right py-2 px-3 font-medium text-text-secondary">Price</th>
              <th className="text-right py-2 px-3 font-medium text-text-secondary">Change</th>
              <th className="text-center py-2 px-3 font-medium text-text-secondary">7D</th>
              <th className="text-right py-2 px-3 font-medium text-text-secondary">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isUp = item.change >= 0;
              return (
                <tr
                  key={item.symbol}
                  className="border-b hover:bg-surface-tertiary transition-colors"
                  style={{ borderColor: tokens.colors.surfaceVariant.border }}
                  onMouseEnter={() => setHoveredSymbol(item.symbol)}
                  onMouseLeave={() => setHoveredSymbol(null)}
                >
                  <td className="py-3 px-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-text-primary">{item.symbol}</span>
                      <span className="text-xs text-text-secondary">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono">${item.price.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right">
                    <Badge
                      label={`${isUp ? '+' : ''}${item.changePct.toFixed(2)}%`}
                      variant={isUp ? 'up' : 'down'}
                      size="sm"
                    />
                  </td>
                  <td className="py-3 px-3 text-center">{renderSparkline(item.sparkline)}</td>
                  <td className="py-3 px-3 text-right">
                    {hoveredSymbol === item.symbol && (
                      <button
                        onClick={() => onRemove?.(item.symbol)}
                        className="text-xs text-status-down hover:opacity-80 transition-opacity"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-text-secondary">
          <p className="text-sm">No symbols in watchlist</p>
        </div>
      )}
    </Card>
  );
};
