'use client';

import React, { useState, useEffect } from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { HeatmapGrid, SectorHeatmap } from '@/components/modules/heatmap';

interface HeatmapData {
  symbol: string;
  change: number;
  sector: string;
}

export default function HeatmapPage() {
  const [view, setView] = useState<'grid' | 'sector'>('grid');
  const [data, setData] = useState<HeatmapData[]>([]);

  useEffect(() => {
    // Fetch heatmap data
    const fetchData = async () => {
      try {
        const response = await fetch('/api/heatmap');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch heatmap data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Market Heatmap</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setView('grid')}
              className={`px-4 py-2 rounded-lg ${
                view === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setView('sector')}
              className={`px-4 py-2 rounded-lg ${
                view === 'sector' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Sector View
            </button>
          </div>
        </div>

        {view === 'grid' ? (
          <HeatmapGrid data={data} />
        ) : (
          <SectorHeatmap data={data} />
        )}
      </div>
    </PageShell>
  );
}