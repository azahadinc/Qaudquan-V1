'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

interface HeatmapData {
  symbol: string;
  change: number;
  sector: string;
}

interface SectorHeatmapProps {
  data: HeatmapData[];
}

export const SectorHeatmap: React.FC<SectorHeatmapProps> = ({ data }) => {
  const sectors = Array.from(new Set(data.map(item => item.sector)));

  const sectorData = sectors.map(sector => {
    const sectorItems = data.filter(item => item.sector === sector);
    const avgChange = sectorItems.reduce((sum, item) => sum + item.change, 0) / sectorItems.length;
    return { sector, avgChange, count: sectorItems.length };
  });

  const getColor = (change: number) => {
    if (change > 3) return 'bg-green-600';
    if (change > 1) return 'bg-green-400';
    if (change > 0) return 'bg-green-200';
    if (change > -1) return 'bg-red-200';
    if (change > -3) return 'bg-red-400';
    return 'bg-red-600';
  };

  const getTextColor = (change: number) => {
    return Math.abs(change) > 1.5 ? 'text-white' : 'text-gray-900';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sectorData.map(({ sector, avgChange, count }) => (
        <Card key={sector}>
          <h4 className="text-md font-semibold mb-2">{sector}</h4>
          <div className={`p-4 rounded-lg text-center ${getColor(avgChange)} ${getTextColor(avgChange)}`}>
            <div className="text-2xl font-bold">{avgChange.toFixed(2)}%</div>
            <div className="text-sm opacity-80">{count} stocks</div>
          </div>
        </Card>
      ))}
    </div>
  );
};