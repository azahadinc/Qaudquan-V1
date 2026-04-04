'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface IndicatorSidebarProps {
  latest: {
    sma20: number | null;
    ema20: number | null;
    rsi: number | null;
    macd: number | null;
    macdSignal: number | null;
    bollinger: { upper: number; middle: number; lower: number } | null;
  };
}

const formatValue = (value: number | null | undefined, suffix = '') =>
  value === null || value === undefined || Number.isNaN(value) ? '–' : `${value.toFixed(2)}${suffix}`;

export const IndicatorSidebar: React.FC<IndicatorSidebarProps> = ({ latest }: IndicatorSidebarProps) => {
  return (
    <Card className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Indicator Snapshot</h3>
        <p className="text-sm text-slate-500">Latest computed values for the selected symbol.</p>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-500">SMA 20</span>
            <span className="font-semibold">{formatValue(latest.sma20)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 mt-2">
            <span className="text-sm text-slate-500">EMA 20</span>
            <span className="font-semibold">{formatValue(latest.ema20)}</span>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-500">RSI</span>
            <Badge
              label={formatValue(latest.rsi)}
              variant={latest.rsi !== null && latest.rsi > 70 ? 'down' : latest.rsi !== null && latest.rsi < 30 ? 'up' : 'neutral'}
              size="sm"
            />
          </div>
          <div className="flex items-center justify-between gap-4 mt-2">
            <span className="text-sm text-slate-500">MACD</span>
            <span className="font-semibold">{formatValue(latest.macd)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 mt-2">
            <span className="text-sm text-slate-500">Signal</span>
            <span className="font-semibold">{formatValue(latest.macdSignal)}</span>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-500">Bollinger Upper</span>
            <span className="font-semibold">{formatValue(latest.bollinger?.upper)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 mt-2">
            <span className="text-sm text-slate-500">Bollinger Middle</span>
            <span className="font-semibold">{formatValue(latest.bollinger?.middle)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 mt-2">
            <span className="text-sm text-slate-500">Bollinger Lower</span>
            <span className="font-semibold">{formatValue(latest.bollinger?.lower)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
