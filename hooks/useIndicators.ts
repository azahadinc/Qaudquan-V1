import { useMemo } from 'react';
import { Candle } from '@/lib/types';
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
} from '@/lib/indicators';

export function useIndicators(candles: Candle[]) {
  const sma20 = useMemo(() => calculateSMA(candles, 20), [candles]);
  const ema20 = useMemo(() => calculateEMA(candles, 20), [candles]);
  const rsi = useMemo(() => calculateRSI(candles, 14), [candles]);
  const macd = useMemo(() => calculateMACD(candles), [candles]);
  const bollinger = useMemo(() => calculateBollingerBands(candles, 20, 2), [candles]);

  return {
    sma20,
    ema20,
    rsi,
    macd,
    bollinger,
  };
}
