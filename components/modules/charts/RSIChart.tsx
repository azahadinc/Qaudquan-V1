'use client';

import { useEffect, useRef } from 'react';
import { createChart, CrosshairMode, IChartApi } from 'lightweight-charts';
import { Card } from '@/components/ui/Card';

export interface RSIChartProps {
  data: Array<{ time: number; value: number }>;
}

export const RSIChart: React.FC<RSIChartProps> = ({ data }: RSIChartProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: '#ffffff' },
        textColor: '#0f172a',
      },
      grid: {
        vertLines: { color: '#e2e8f0' },
        horzLines: { color: '#e2e8f0' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: '#e2e8f0',
      },
      timeScale: {
        borderColor: '#e2e8f0',
        timeVisible: true,
      },
      width: containerRef.current.clientWidth,
      height: 180,
    });

    const lineSeries = chart.addLineSeries({
      color: '#2563eb',
      lineWidth: 2,
    });

    lineSeries.setData(data as any);
    chartRef.current = chart;

    return () => chart.remove();
  }, [data]);

  return (
    <Card>
      <div className="mb-4">
        <h4 className="text-base font-semibold">RSI</h4>
        <p className="text-sm text-slate-500">Momentum oscillator; overbought when above 70, oversold below 30.</p>
      </div>
      <div ref={containerRef} className="min-h-[180px] w-full" />
    </Card>
  );
};
