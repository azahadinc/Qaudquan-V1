/**
 * OANDA data normaliser
 * Converts OANDA pricing stream messages to canonical Tick format
 */

import { Tick } from '../../types';

interface OANDAPricing {
  type: string;
  time: string;
  bids: Array<{
    price: string;
    liquidity: number;
  }>;
  asks: Array<{
    price: string;
    liquidity: number;
  }>;
  closeoutBid: string;
  closeoutAsk: string;
  status: string;
  tradeable: boolean;
  instrument: string;
}

export function normaliseOANDA(raw: OANDAPricing): Tick {
  const bid = parseFloat(raw.bids[0]?.price || '0');
  const ask = parseFloat(raw.asks[0]?.price || '0');
  const mid = (bid + ask) / 2;

  return {
    symbol: raw.instrument.replace('_', '/'), // EUR_USD -> EUR/USD
    market: 'forex' as const,
    price: mid,
    open: mid,
    high: mid,
    low: mid,
    close: mid,
    volume: 0, // OANDA doesn't provide volume in pricing stream
    timestamp: new Date(raw.time).getTime(),
    exchange: 'OANDA',
    change: 0, // computed downstream
    changePct: 0,
    bid,
    ask,
  };
}