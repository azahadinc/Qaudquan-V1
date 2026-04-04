/**
 * Polygon.io data normaliser
 * Converts Polygon trade and quote messages to canonical Tick format
 */

import { Tick } from '../../types';

interface PolygonTrade {
  ev: string; // event type
  sym: string; // symbol
  p: number; // price
  s: number; // size
  t: number; // timestamp
  x: number; // exchange id
}

interface PolygonQuote {
  ev: string;
  sym: string;
  bp: number; // bid price
  bs: number; // bid size
  ap: number; // ask price
  as: number; // ask size
  t: number;
  x: number;
}

export function normalisePolygon(raw: PolygonTrade | PolygonQuote): Tick {
  const base = {
    symbol: raw.sym,
    market: 'equity' as const,
    timestamp: raw.t,
    exchange: raw.x.toString(),
    change: 0, // computed downstream
    changePct: 0,
  };

  if ('p' in raw) {
    // Trade message
    return {
      ...base,
      price: raw.p,
      size: raw.s,
      open: raw.p,
      high: raw.p,
      low: raw.p,
      close: raw.p,
      volume: raw.s,
    };
  } else {
    // Quote message
    return {
      ...base,
      price: (raw.bp + raw.ap) / 2, // mid price
      bid: raw.bp,
      ask: raw.ap,
      size: 0,
      open: (raw.bp + raw.ap) / 2,
      high: Math.max(raw.bp, raw.ap),
      low: Math.min(raw.bp, raw.ap),
      close: (raw.bp + raw.ap) / 2,
      volume: 0,
    };
  }
}