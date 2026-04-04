/**
 * Alpaca data normaliser
 * Converts Alpaca WebSocket messages to canonical Tick format
 */

import { Tick } from '../../types';

interface AlpacaTrade {
  T: 't';
  S: string; // symbol
  p: number; // price
  s: number; // size
  t: string; // timestamp
  c: string[]; // conditions
  i: number; // trade id
  x: string; // exchange
}

interface AlpacaQuote {
  T: 'q';
  S: string; // symbol
  bp: number; // bid price
  bs: number; // bid size
  ap: number; // ask price
  as: number; // ask size
  t: string; // timestamp
  c: string[]; // conditions
  z: string; // tape
}

type AlpacaMessage = AlpacaTrade | AlpacaQuote;

export function normaliseAlpaca(raw: AlpacaMessage): Tick {
  const symbol = raw.S;
  const timestamp = new Date(raw.t).getTime();

  if (raw.T === 't') {
    // Trade message
    const trade = raw as AlpacaTrade;
    return {
      symbol,
      market: 'equity' as const, // Alpaca primarily for equities
      price: trade.p,
      open: trade.p,
      high: trade.p,
      low: trade.p,
      close: trade.p,
      volume: trade.s,
      timestamp,
      exchange: 'ALPACA',
      change: 0, // computed downstream
      changePct: 0,
      bid: trade.p,
      ask: trade.p,
    };
  } else {
    // Quote message
    const quote = raw as AlpacaQuote;
    const mid = (quote.bp + quote.ap) / 2;
    return {
      symbol,
      market: 'equity' as const,
      price: mid,
      open: mid,
      high: mid,
      low: mid,
      close: mid,
      volume: 0, // quotes don't have volume
      timestamp,
      exchange: 'ALPACA',
      change: 0, // computed downstream
      changePct: 0,
      bid: quote.bp,
      ask: quote.ap,
    };
  }
}