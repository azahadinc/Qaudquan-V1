'use client';

import { Card } from '@/components/ui/Card';

interface ChartToolbarProps {
  showSMA: boolean;
  showEMA: boolean;
  showBollinger: boolean;
  onToggleSMA: () => void;
  onToggleEMA: () => void;
  onToggleBollinger: () => void;
}

export const ChartToolbar: React.FC<ChartToolbarProps> = ({
  showSMA,
  showEMA,
  showBollinger,
  onToggleSMA,
  onToggleEMA,
  onToggleBollinger,
}: ChartToolbarProps) => {
  return (
    <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h3 className="text-lg font-semibold">Chart Controls</h3>
        <p className="text-sm text-slate-500">Toggle overlays and indicator visibility.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onToggleSMA}
          className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${showSMA ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-700'}`}
        >
          SMA 20
        </button>
        <button
          type="button"
          onClick={onToggleEMA}
          className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${showEMA ? 'border-orange-600 bg-orange-600 text-white' : 'border-slate-300 bg-white text-slate-700'}`}
        >
          EMA 20
        </button>
        <button
          type="button"
          onClick={onToggleBollinger}
          className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${showBollinger ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-300 bg-white text-slate-700'}`}
        >
          Bollinger Bands
        </button>
      </div>
    </Card>
  );
};
