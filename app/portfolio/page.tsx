'use client';

import React from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { MetricCard } from '@/components/modules/dashboard';
import { AllocationBar, AllocationDonut, HoldingsTable } from '@/components/modules/portfolio';
import { usePortfolio } from '@/hooks';

export default function PortfolioPage() {
  const {
    totalValue,
    invested,
    unrealizedPnL,
    unrealizedPnLPct,
    cashBalance,
    beta,
    sharpeRatio,
    holdings,
    allocation,
  } = usePortfolio();

  const allocationPalette = ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA'];
  const allocationData = allocation.map((entry, index) => ({
    ...entry,
    color: allocationPalette[index % allocationPalette.length],
  }));

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          <MetricCard
            label="Total Value"
            value={totalValue}
            formatter={(value) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            trend={unrealizedPnL >= 0 ? 'up' : 'down'}
            trendValue={`${unrealizedPnLPct.toFixed(1)}%`}
            subLabel="Current portfolio value"
          />
          <MetricCard
            label="Invested Capital"
            value={invested}
            formatter={(value) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            trend="neutral"
            subLabel="Total cost basis"
          />
          <MetricCard
            label="Unrealised P&L"
            value={unrealizedPnL}
            formatter={(value) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            trend={unrealizedPnL >= 0 ? 'up' : 'down'}
            trendValue={`${unrealizedPnLPct.toFixed(1)}%`}
            subLabel="Position profit / loss"
          />
          <MetricCard
            label="Beta"
            value={beta}
            formatter={(value) => value.toFixed(2)}
            trend="neutral"
            subLabel="Daily risk metric"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <HoldingsTable holdings={holdings} />
          </div>
          <div className="space-y-6">
            <AllocationDonut allocations={allocationData} />
            <AllocationBar allocations={allocationData} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-surface-tertiary bg-surface-primary p-6">
            <h2 className="text-lg font-semibold mb-3">Cash Balance</h2>
            <p className="text-3xl font-bold">${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="mt-2 text-sm text-text-secondary">Available funds ready for deployment.</p>
          </div>
          <div className="rounded-xl border border-surface-tertiary bg-surface-primary p-6">
            <h2 className="text-lg font-semibold mb-3">Portfolio Health</h2>
            <p className="text-3xl font-bold">Sharpe {sharpeRatio.toFixed(2)}</p>
            <p className="mt-2 text-sm text-text-secondary">Statistical risk-adjusted performance metric.</p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
