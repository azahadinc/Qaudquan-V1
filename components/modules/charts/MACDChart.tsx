'use client';

import { useEffect, useRef } from 'react';
import { createChart, CrosshairMode, LineData, HistogramData, IChartApi } from 'lightweight-charts';
import { Card } from '@/components/ui/Card';

export interface MACDChartProps {
  macdData: Array<{ time: number; value: number }>;
  signalData: Array<{ time: number; value: number }>;
  histogramData: Array<{ time: number; value: number }>;
}

export const MACDChart: React.FC<MACDChartProps> = ({ macdData, signalData, histogramData }: MACDChartProps) => {
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
      height: 200,
    });

    const histogramSeries = chart.addHistogramSeries({
      color: '#f97316',
      priceFormat: { type: 'price', precision: 2 },
      priceScaleId: '',
    });
    const macdSeries = chart.addLineSeries({
      color: '#2563eb',
      lineWidth: 2,
    });
    const signalSeries = chart.addLineSeries({
      color: '#ef4444',
      lineWidth: 2,
    });

    histogramSeries.setData(histogramData as HistogramData[]);
    macdSeries.setData(macdData as LineData[]);
    signalSeries.setData(signalData as LineData[]);

    chartRef.current = chart;

    return () => chart.remove();
  }, [macdData, signalData, histogramData]);

  return (
    <Card>
      <div className="mb-4">
        <h4 className="text-base font-semibold">MACD</h4>
        <p className="text-sm text-slate-500">Trend strength and momentum with histogram divergence.</p>
      </div>
      <div ref={containerRef} className="min-h-[200px] w-full" />
    </Card>
  );
};
