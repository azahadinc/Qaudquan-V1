'use client';

import { useEffect, useRef } from 'react';
import { createChart, CrosshairMode, IChartApi, ISeriesApi, LineData, CandlestickData } from 'lightweight-charts';
import { Card } from '@/components/ui/Card';

export interface PriceChartProps {
  candles: Array<{ time: number; open: number; high: number; low: number; close: number }>;
  smaData: Array<{ time: number; value: number }>;
  emaData: Array<{ time: number; value: number }>;
  bollingerData: Array<{ time: number; upper: number; middle: number; lower: number }>;
}

export const PriceChart: React.FC<PriceChartProps> = ({ candles, smaData, emaData, bollingerData }: PriceChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const smaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const upperBandRef = useRef<ISeriesApi<'Line'> | null>(null);
  const middleBandRef = useRef<ISeriesApi<'Line'> | null>(null);
  const lowerBandRef = useRef<ISeriesApi<'Line'> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
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
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: 420,
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#16a34a',
      wickDownColor: '#dc2626',
    });

    candleSeries.setData(candles as CandlestickData[]);
    chartRef.current = chart;

    return () => chart.remove();
  }, [candles]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (smaData.length > 0) {
      if (!smaSeriesRef.current) {
        smaSeriesRef.current = chartRef.current.addLineSeries({
          color: '#2563eb',
          lineWidth: 2,
        });
      }
      smaSeriesRef.current.setData(smaData as LineData[]);
    } else if (smaSeriesRef.current) {
      chartRef.current.removeSeries(smaSeriesRef.current);
      smaSeriesRef.current = null;
    }
  }, [smaData]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (emaData.length > 0) {
      if (!emaSeriesRef.current) {
        emaSeriesRef.current = chartRef.current.addLineSeries({
          color: '#f97316',
          lineWidth: 2,
        });
      }
      emaSeriesRef.current.setData(emaData as LineData[]);
    } else if (emaSeriesRef.current) {
      chartRef.current.removeSeries(emaSeriesRef.current);
      emaSeriesRef.current = null;
    }
  }, [emaData]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (bollingerData.length > 0) {
      if (!upperBandRef.current) {
        upperBandRef.current = chartRef.current.addLineSeries({ color: '#6366f1', lineWidth: 1, lineStyle: 2 });
        middleBandRef.current = chartRef.current.addLineSeries({ color: '#2563eb', lineWidth: 1, lineStyle: 1 });
        lowerBandRef.current = chartRef.current.addLineSeries({ color: '#6366f1', lineWidth: 1, lineStyle: 2 });
      }

      if (upperBandRef.current && middleBandRef.current && lowerBandRef.current) {
        upperBandRef.current.setData(bollingerData.map((item) => ({ time: item.time, value: item.upper })) as LineData[]);
        middleBandRef.current.setData(bollingerData.map((item) => ({ time: item.time, value: item.middle })) as LineData[]);
        lowerBandRef.current.setData(bollingerData.map((item) => ({ time: item.time, value: item.lower })) as LineData[]);
      }
    } else {
      if (upperBandRef.current) {
        chartRef.current.removeSeries(upperBandRef.current);
        upperBandRef.current = null;
      }
      if (middleBandRef.current) {
        chartRef.current.removeSeries(middleBandRef.current);
        middleBandRef.current = null;
      }
      if (lowerBandRef.current) {
        chartRef.current.removeSeries(lowerBandRef.current);
        lowerBandRef.current = null;
      }
    }
  }, [bollingerData]);

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Price Chart</h3>
          <p className="text-sm text-slate-500">Candlestick price action with overlay indicators.</p>
        </div>
      </div>
      <div ref={chartContainerRef} className="min-h-[420px] w-full" />
    </Card>
  );
};
