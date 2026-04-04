/**
 * Alpha Vantage data normaliser
 * Converts Alpha Vantage commodity data to canonical Tick format
 */

import { Tick } from '../../types';

interface AlphaVantageResponse {
  'Global Quote': {
    '01. symbol': string;
    '02. open': string;
    '03. high': string;
    '04. low': string;
    '05. price': string;
    '06. volume': string;
    '07. latest trading day': string;
    '08. previous close': string;
    '09. change': string;
    '10. change percent': string;
  };
}

export function normaliseAlphaVantage(raw: AlphaVantageResponse): Tick {
  const quote = raw['Global Quote'];

  return {
    symbol: quote['01. symbol'],
    market: 'commodity' as const,
    price: parseFloat(quote['05. price']),
    open: parseFloat(quote['02. open']),
    high: parseFloat(quote['03. high']),
    low: parseFloat(quote['04. low']),
    close: parseFloat(quote['05. price']),
    volume: parseFloat(quote['06. volume']),
    timestamp: new Date(quote['07. latest trading day']).getTime(),
    exchange: 'ALPHA_VANTAGE',
    change: parseFloat(quote['09. change']),
    changePct: parseFloat(quote['10. change percent'].replace('%', '')),
  };
}