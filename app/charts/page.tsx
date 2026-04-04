'use client';

import { useMemo, useState } from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { PriceChart } from '@/components/modules/charts/PriceChart';
import { RSIChart } from '@/components/modules/charts/RSIChart';
import { MACDChart } from '@/components/modules/charts/MACDChart';
import { ChartToolbar } from '@/components/modules/charts/ChartToolbar';
import { IndicatorSidebar } from '@/components/modules/charts/IndicatorSidebar';
import { useIndicators } from '@/hooks/useIndicators';
import { Candle } from '@/lib/types';

const buildSampleCandles = (count: number): Candle[] => {
  const now = Date.now();
  const candles: Candle[] = [];
  let lastClose = 370;

  for (let i = 0; i < count; i += 1) {
    const timestamp = now - (count - i) * 24 * 60 * 60 * 1000;
    const open = lastClose + (Math.random() - 0.5) * 8;
    const close = open + (Math.random() - 0.5) * 10;
    const high = Math.max(open, close) + Math.random() * 6;
    const low = Math.min(open, close) - Math.random() * 6;
    const volume = 20_000_000 + Math.round(Math.random() * 40_000_000);

    candles.push({
      timestamp,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    });

    lastClose = close;
  }

  return candles;
};

export default function ChartsPage() {
  const [showSMA, setShowSMA] = useState(true);
  const [showEMA, setShowEMA] = useState(true);
  const [showBollinger, setShowBollinger] = useState(true);

  const candles = useMemo(() => buildSampleCandles(60), []);
  const indicators = useIndicators(candles);

  const priceData = useMemo(
    () => candles.map((c) => ({
      time: Math.floor(c.timestamp / 1000),
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    })),
    [candles],
  );

  const smaData = useMemo(
    () => candles
      .map((c, index) => ({ time: Math.floor(c.timestamp / 1000), value: indicators.sma20[index] }))
      .filter((item) => Number.isFinite(item.value)),
    [candles, indicators.sma20],
  );

  const emaData = useMemo(
    () => candles
      .map((c, index) => ({ time: Math.floor(c.timestamp / 1000), value: indicators.ema20[index] }))
      .filter((item) => Number.isFinite(item.value)),
    [candles, indicators.ema20],
  );

  const bollingerData = useMemo(
    () => candles
      .map((c, index) => ({
        time: Math.floor(c.timestamp / 1000),
        upper: indicators.bollinger[index]?.upper,
        middle: indicators.bollinger[index]?.middle,
        lower: indicators.bollinger[index]?.lower,
      }))
      .filter((item) => Number.isFinite(item.middle)),
    [candles, indicators.bollinger],
  );

  const rsiData = useMemo(
    () => candles
      .map((c, index) => ({ time: Math.floor(c.timestamp / 1000), value: indicators.rsi[index] }))
      .filter((item) => Number.isFinite(item.value)),
    [candles, indicators.rsi],
  );

  const macdLineData = useMemo(
    () => candles
      .map((c, index) => ({ time: Math.floor(c.timestamp / 1000), value: indicators.macd[index]?.value }))
      .filter((item) => Number.isFinite(item.value)) as Array<{ time: number; value: number }>,
    [candles, indicators.macd],
  );

  const macdSignalData = useMemo(
    () => candles
      .map((c, index) => ({ time: Math.floor(c.timestamp / 1000), value: indicators.macd[index]?.signal }))
      .filter((item) => Number.isFinite(item.value)) as Array<{ time: number; value: number }>,
    [candles, indicators.macd],
  );

  const macdHistogramData = useMemo(
    () => candles
      .map((c, index) => ({ time: Math.floor(c.timestamp / 1000), value: indicators.macd[index]?.histogram }))
      .filter((item) => Number.isFinite(item.value)) as Array<{ time: number; value: number }>,
    [candles, indicators.macd],
  );

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-4">
            <ChartToolbar
              showSMA={showSMA}
              showEMA={showEMA}
              showBollinger={showBollinger}
              onToggleSMA={() => setShowSMA((state) => !state)}
              onToggleEMA={() => setShowEMA((state) => !state)}
              onToggleBollinger={() => setShowBollinger((state) => !state)}
            />

            <PriceChart
              candles={priceData}
              smaData={showSMA ? smaData : []}
              emaData={showEMA ? emaData : []}
              bollingerData={showBollinger ? bollingerData : []}
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <RSIChart data={rsiData} />
              <MACDChart
                macdData={macdLineData}
                signalData={macdSignalData}
                histogramData={macdHistogramData}
              />
            </div>
          </div>

          <IndicatorSidebar
            latest={{
              sma20: indicators.sma20[indicators.sma20.length - 1] ?? null,
              ema20: indicators.ema20[indicators.ema20.length - 1] ?? null,
              rsi: indicators.rsi[indicators.rsi.length - 1] ?? null,
              macd: indicators.macd[indicators.macd.length - 1]?.value ?? null,
              macdSignal: indicators.macd[indicators.macd.length - 1]?.signal ?? null,
              bollinger: indicators.bollinger[indicators.bollinger.length - 1] ?? null,
            }}
          />
        </div>
      </div>
    </PageShell>
  );
}
