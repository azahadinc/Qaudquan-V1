/**
 * Provider configuration for live data feeds
 * Maps market types to their respective data providers
 */

export type Provider = 'polygon' | 'binance' | 'oanda' | 'alphavantage' | 'finnhub';

export interface ProviderConfig {
  name: string;
  url: string;
  apiKey?: string;
  markets: string[];
  isWebSocket: boolean;
  authRequired: boolean;
}

export const PROVIDER_CONFIGS: Record<Provider, ProviderConfig> = {
  polygon: {
    name: 'Polygon.io',
    url: 'wss://socket.polygon.io/stocks',
    apiKey: process.env.NEXT_PUBLIC_POLYGON_API_KEY,
    markets: ['equity'],
    isWebSocket: true,
    authRequired: true,
  },
  binance: {
    name: 'Binance',
    url: 'wss://stream.binance.com:9443/ws',
    markets: ['crypto'],
    isWebSocket: true,
    authRequired: false,
  },
  oanda: {
    name: 'OANDA',
    url: 'https://stream-fxpractice.oanda.com/v3/accounts/{accountId}/pricing/stream',
    apiKey: process.env.OANDA_API_KEY,
    markets: ['forex'],
    isWebSocket: false, // HTTP streaming
    authRequired: true,
  },
  alphavantage: {
    name: 'Alpha Vantage',
    url: 'https://www.alphavantage.co/query',
    apiKey: process.env.ALPHA_VANTAGE_API_KEY,
    markets: ['commodity'],
    isWebSocket: false,
    authRequired: true,
  },
  finnhub: {
    name: 'Finnhub',
    url: 'wss://ws.finnhub.io',
    apiKey: process.env.FINNHUB_API_KEY,
    markets: ['sentiment'],
    isWebSocket: true,
    authRequired: true,
  },
};

export type ConnectionStatus = 'connected' | 'connecting' | 'reconnecting' | 'error' | 'degraded';