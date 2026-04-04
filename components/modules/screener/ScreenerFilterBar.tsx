'use client';

import { Card } from '@/components/ui/Card';
import { tokens } from '@/config/tokens';

export interface ScreenerFilterBarProps {
  market: string;
  query: string;
  onMarketChange: (market: string) => void;
  onQueryChange: (search: string) => void;
  onReset?: () => void;
}

const markets = ['all', 'equity', 'crypto', 'forex', 'commodity'] as const;

export const ScreenerFilterBar: React.FC<ScreenerFilterBarProps> = ({
  market,
  query,
  onMarketChange,
  onQueryChange,
  onReset,
}: ScreenerFilterBarProps) => {
  return (
    <Card className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h3 className="text-lg font-semibold mb-1">Screener</h3>
        <p className="text-sm text-text-secondary max-w-xl">
          Filter and scan instruments by market type, symbol, and real-time metrics.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[240px_240px_auto] w-full">
        <label className="block">
          <span className="text-sm text-text-secondary">Market</span>
          <select
            value={market}
            onChange={(event) => onMarketChange(event.target.value)}
            className="mt-2 w-full rounded-lg border px-3 py-2 bg-surface-secondary border-surface-tertiary text-sm text-text-primary focus:outline-none"
            style={{
              backgroundColor: tokens.colors.surface.variant,
              borderColor: tokens.colors.surfaceVariant.border,
            }}
          >
            {markets.map((item) => (
              <option key={item} value={item}>
                {item === 'all' ? 'All Markets' : item.charAt(0).toUpperCase() + item.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm text-text-secondary">Search</span>
          <input
            type="text"
            placeholder="Symbol or name"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            className="mt-2 w-full rounded-lg border px-3 py-2 bg-surface-secondary border-surface-tertiary text-sm text-text-primary focus:outline-none"
            style={{
              backgroundColor: tokens.colors.surface.variant,
              borderColor: tokens.colors.surfaceVariant.border,
            }}
          />
        </label>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReset}
            className="h-11 rounded-lg border border-surface-tertiary bg-surface-secondary px-4 text-sm font-medium text-text-primary transition hover:border-primary"
            style={{
              backgroundColor: tokens.colors.surface.variant,
              borderColor: tokens.colors.surfaceVariant.border,
            }}
          >
            Reset filters
          </button>
        </div>
      </div>
    </Card>
  );
};
