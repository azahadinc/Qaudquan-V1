/**
 * Core TypeScript interfaces
 * Canonical data types used throughout the application
 */

export type Market = 'equity' | 'crypto' | 'forex' | 'commodity';
export type TimeFrame = '1d' | '1w' | '1m' | '3m' | '1y';
export type SignalType = 'buy' | 'sell' | 'neutral';

/**
 * Single market tick/quote (latest price data)
 */
export interface Tick {
  symbol: string;
  market: Market;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
  change: number;
  changePct: number;
  exchange?: string;
  size?: number;
  bid?: number;
  ask?: number;
}

/**
 * OHLCV candle data
 */
export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Instrument/security metadata
 */
export interface Instrument {
  symbol: string;
  name: string;
  market: Market;
  currency: string;
  exchange: string;
  marketCap?: number;
  logo?: string;
}

/**
 * Portfolio position
 */
export interface Position {
  symbol: string;
  quantity: number;
  averageCost: number;
  market: Market;
  entryTime: number;
  currentPrice?: number;
}

/**
 * Trade execution record
 */
export interface Trade {
  id: string;
  symbol: string;
  market: Market;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  timestamp: number;
  commission?: number;
  notes?: string;
}

/**
 * Screener filter configuration
 */
export interface ScreenerFilter {
  field: 'rsi' | 'volume' | 'changePct' | 'macd' | 'price' | 'marketCap';
  operator: 'gt' | 'lt' | 'between' | 'eq';
  value: number | [number, number];
}

/**
 * Signal with confidence
 */
export interface Signal {
  id: string;
  symbol: string;
  type: SignalType;
  rule: string;
  confidence: number; // 0-100
  timestamp: number;
  expiresAt: number;
  isBookmarked?: boolean;
  validatedPrice?: number; // price after signal fired
}

/**
 * Technical indicator results
 */
export interface Indicators {
  rsi?: number;
  macd?: number;
  macdSignal?: number;
  macdHistogram?: number;
  sma20?: number;
  sma50?: number;
  sma200?: number;
  ema12?: number;
  ema26?: number;
  bollingerUpper?: number;
  bollingerMiddle?: number;
  bollingerLower?: number;
  atr?: number;
  vwap?: number;
  stochRsi?: number;
  volume?: number;
  volumeAvg?: number;
}

/**
 * MACD result
 */
export interface MACDResult {
  macd: number;
  signal: number;
  histogram: number;
}

/**
 * Bollinger Bands result
 */
export interface BBResult {
  upper: number;
  middle: number;
  lower: number;
}

/**
 * Stochastic RSI result
 */
export interface StochResult {
  k: number;
  d: number;
}

/**
 * Market breadth snapshot
 */
export interface MarketBreadth {
  timestamp: number;
  advancing: number;
  declining: number;
  unchanged: number;
}

/**
 * Sector performance
 */
export interface SectorPerformance {
  sector: string;
  changePct: number;
  advancing: number;
  declining: number;
}

/**
 * Top movers data
 */
export interface TopMovers {
  gainers: Array<{
    symbol: string;
    name: string;
    changePct: number;
    price: number;
  }>;
  losers: Array<{
    symbol: string;
    name: string;
    changePct: number;
    price: number;
  }>;
}

/**
 * Drawing annotation
 */
export interface Drawing {
  id: string;
  type: 'trendline' | 'horizontal' | 'rectangle';
  symbol: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  timestamp: number;
}

/**
 * Alert/notification
 */
export interface Alert {
  id: string;
  symbol: string;
  type: 'price' | 'signal' | 'portfolio';
  condition: string;
  value?: number;
  isActive: boolean;
  createdAt: number;
}
