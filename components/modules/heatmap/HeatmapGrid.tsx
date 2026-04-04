'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

interface HeatmapData {
  symbol: string;
  change: number;
  sector: string;
}

interface HeatmapGridProps {
  data: HeatmapData[];
}

export const HeatmapGrid: React.FC<HeatmapGridProps> = ({ data }) => {
  const getColor = (change: number) => {
    if (change > 5) return 'bg-green-600';
    if (change > 2) return 'bg-green-400';
    if (change > 0) return 'bg-green-200';
    if (change > -2) return 'bg-red-200';
    if (change > -5) return 'bg-red-400';
    return 'bg-red-600';
  };

  const getTextColor = (change: number) => {
    return Math.abs(change) > 2 ? 'text-white' : 'text-gray-900';
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">S&P 500 Heatmap</h3>
      <div className="grid grid-cols-20 gap-1 max-h-96 overflow-y-auto">
        {data.slice(0, 400).map((item) => (
          <div
            key={item.symbol}
            className={`p-2 rounded text-xs font-medium text-center cursor-pointer hover:opacity-80 transition-opacity ${getColor(item.change)} ${getTextColor(item.change)}`}
            title={`${item.symbol}: ${item.change.toFixed(2)}%`}
          >
            {item.symbol}
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between text-sm text-gray-600">
        <span>-10%</span>
        <span className="text-green-600">+10%</span>
      </div>
    </Card>
  );
};