'use client';

import React, { useState } from 'react';
import { PageShell } from '@/components/layout/PageShell';
import {
  MetricCard,
  PerformanceChart,
  Watchlist,
  MarketBreadth,
  SectorRotation,
  TopMovers,
} from '@/components/modules/dashboard';

interface ChartDataPoint {
  timestamp: number;
  value: number;
}

export default function DashboardPage() {
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1D');

  // Sample data for performance chart
  const portfolioData: ChartDataPoint[] = Array.from({ length: 30 }, (_, i) => ({
    timestamp: Date.now() - (30 - i) * 86400000,
    value: 97500 + Math.random() * 5000 + i * 100,
  }));

  // Sample watchlist data
  const watchlistItems = [
    {
      symbol: 'AAPL',
      name: 'Apple Inc',
      price: 189.45,
      change: 5.23,
      changePct: 2.84,
      sparkline: [180, 182, 181, 185, 187, 188, 189],
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      price: 412.89,
      change: 12.34,
      changePct: 3.08,
      sparkline: [395, 398, 400, 405, 410, 411, 412],
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc',
      price: 234.56,
      change: 9.87,
      changePct: 4.38,
      sparkline: [215, 218, 220, 225, 230, 232, 234],
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      price: 875.34,
      change: 45.67,
      changePct: 5.52,
      sparkline: [800, 820, 835, 850, 860, 870, 875],
    },
    {
      symbol: 'AMZN',
      name: 'Amazon.com Inc',
      price: 178.23,
      change: 3.45,
      changePct: 1.97,
      sparkline: [170, 172, 171, 174, 176, 177, 178],
    },
  ];

  // Sample sector data
  const sectorData = [
    { name: 'Technology', changePct: 2.34 },
    { name: 'Healthcare', changePct: 1.23 },
    { name: 'Financials', changePct: 0.87 },
    { name: 'Energy', changePct: -0.45 },
    { name: 'Utilities', changePct: -1.22 },
    { name: 'Consumer', changePct: 0.56 },
  ];

  const moversData = {
    gainers: [
      { symbol: 'NVDA', name: 'NVIDIA', price: 875.34, changePct: 5.23 },
      { symbol: 'TSLA', name: 'Tesla', price: 234.56, changePct: 4.78 },
      { symbol: 'MSFT', name: 'Microsoft', price: 412.89, changePct: 3.45 },
      { symbol: 'AAPL', name: 'Apple', price: 189.45, changePct: 2.89 },
      { symbol: 'AMZN', name: 'Amazon', price: 178.23, changePct: 2.34 },
    ],
    losers: [
      { symbol: 'IBM', name: 'IBM', price: 156.78, changePct: -3.45 },
      { symbol: 'KO', name: 'Coca-Cola', price: 64.32, changePct: -2.87 },
      { symbol: 'PG', name: 'Procter & Gamble', price: 165.43, changePct: -2.34 },
      { symbol: 'JNJ', name: 'Johnson & Johnson', price: 156.89, changePct: -1.98 },
      { symbol: 'XOM', name: 'Exxon Mobil', price: 112.34, changePct: -1.56 },
    ],
  };

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Portfolio Value"
            value={102500.50}
            previousValue={100000}
            formatter={(v) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            trend="up"
            trendValue="+2.5%"
            subLabel="Today"
          />
          <MetricCard
            label="Day P&L"
            value={2500.50}
            previousValue={1500}
            formatter={(v) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            trend="up"
            trendValue="+66.7%"
            subLabel="+2.5% return"
          />
          <MetricCard
            label="Win Rate"
            value={68.5}
            formatter={(v) => `${v.toFixed(1)}%`}
            trend="up"
            trendValue="+2.1%"
            subLabel="Last 30 days"
          />
          <MetricCard
            label="Sharpe Ratio"
            value={1.82}
            formatter={(v) => v.toFixed(2)}
            trend="neutral"
            subLabel="Annual"
          />
        </div>

        {/* Performance Chart */}
        <PerformanceChart
          data={portfolioData}
          title="Portfolio Performance"
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
        />

        {/* Market Data Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MarketBreadth advancing={120} declining={80} unchanged={45} />
          <div className="lg:col-span-2">
            <SectorRotation sectors={sectorData} />
          </div>
        </div>

        {/* Watchlist and Movers Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Watchlist
              items={watchlistItems}
              onRemove={(symbol) => console.log('Removed:', symbol)}
            />
          </div>
          <TopMovers gainers={moversData.gainers} losers={moversData.losers} />
        </div>
      </div>
    </PageShell>
  );
}