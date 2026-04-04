/**
 * Binance data normaliser
 * Converts Binance 24hr ticker messages to canonical Tick format
 */

import { Tick } from '../../types';

interface BinanceTicker {
  e: string; // event type
  E: number; // event time
  s: string; // symbol
  p: string; // price change
  P: string; // price change percent
  w: string; // weighted average price
  x: string; // previous day's close price
  c: string; // current price
  Q: string; // current quantity
  b: string; // best bid price
  B: string; // best bid quantity
  a: string; // best ask price
  A: string; // best ask quantity
  o: string; // open price
  h: string; // high price
  l: string; // low price
  v: string; // total traded base asset volume
  q: string; // total traded quote asset volume
  O: number; // statistics open time
  C: number; // statistics close time
  F: number; // first trade ID
  L: number; // last trade ID
  n: number; // total number of trades
}

export function normaliseBinance(raw: BinanceTicker): Tick {
  const price = parseFloat(raw.c);
  const open = parseFloat(raw.o);
  const high = parseFloat(raw.h);
  const low = parseFloat(raw.l);
  const volume = parseFloat(raw.v);

  return {
    symbol: raw.s.replace('USDT', ''), // Remove USDT suffix
    market: 'crypto' as const,
    price,
    open,
    high,
    low,
    close: price,
    volume,
    timestamp: raw.E,
    exchange: 'BINANCE',
    change: parseFloat(raw.p),
    changePct: parseFloat(raw.P),
    bid: parseFloat(raw.b),
    ask: parseFloat(raw.a),
  };
}