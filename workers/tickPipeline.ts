/**
 * Tick Pipeline Worker
 * Orchestrates the entire live data pipeline
 */

import { WebSocketManager } from '../lib/data/WebSocketManager';
import { RESTPoller } from '../lib/data/RESTPoller';
import { SymbolRegistry } from '../lib/data/SymbolRegistry';
import { useTickStore } from '../lib/store/tickStore';
import { useConnectionStatusStore } from '../store/connectionStatusStore';
import { useSettingsStore } from '../store/settingsStore';
import { PROVIDER_CONFIGS, Provider } from '../config/providers';
import { normalisePolygon } from '../lib/data/normaliser/polygon';
import { normaliseBinance } from '../lib/data/normaliser/binance';
import { normaliseAlpaca } from '../lib/data/normaliser/alpaca';
import { normaliseAlphaVantage } from '../lib/data/normaliser/alphavantage';
import { normaliseFinnhub } from '../lib/data/normaliser/finnhub';

export class TickPipeline {
  private wsManager: WebSocketManager;
  private restPoller: RESTPoller;
  private symbolRegistry: SymbolRegistry;
  private initialized = false;

  constructor() {
    this.wsManager = new WebSocketManager();
    this.restPoller = new RESTPoller();
    this.symbolRegistry = new SymbolRegistry(this.wsManager);

    this.setupMessageHandlers();
    this.setupStatusCallbacks();
  }

  /**
   * Initialize the pipeline with symbol universe
   */
  async initialize(symbols: Record<string, string[]>) {
    if (this.initialized) return;

    try {
      // Fetch previous closes for all symbols
      await this.fetchPrevCloses(Object.values(symbols).flat());

      // Start WebSocket connections
      await this.startWebSocketConnections();

      // Start REST polling
      this.startRESTPolling(symbols);

      // Subscribe to initial symbols
      this.subscribeToSymbols(symbols);

      this.initialized = true;
      console.log('Tick pipeline initialized');
    } catch (error) {
      console.error('Failed to initialize tick pipeline:', error);
    }
  }

  /**
   * Reconnect to providers (useful after API key changes)
   */
  async reconnectProviders(): Promise<void> {
    await this.startWebSocketConnections();
  }

  /**
   * Shutdown the pipeline
   */
  shutdown() {
    this.wsManager.destroy();
    this.restPoller.destroy();
    this.initialized = false;
  }

  private async fetchPrevCloses(symbols: string[]) {
    try {
      const response = await fetch(`/api/prevclose?symbols=${symbols.join(',')}`);
      const data = await response.json();

      const setPrevClose = useTickStore.getState().setPrevClose;
      Object.entries(data.prevCloses).forEach(([symbol, price]) => {
        setPrevClose(symbol, price as number);
      });
    } catch (error) {
      console.error('Failed to fetch previous closes:', error);
    }
  }

  private async startWebSocketConnections() {
    const promises = [
      this.wsManager.connect('alpaca'),
      this.wsManager.connect('binance'),
      this.wsManager.connect('finnhub'),
    ];

    await Promise.allSettled(promises);
  }

  private startRESTPolling(symbols: Record<string, string[]>) {
    // Alpha Vantage polling for commodities
    if (symbols.commodity?.length) {
      const apiKey = useSettingsStore.getState().getApiKey('alphavantage');
      if (!apiKey) {
        console.warn('Alpha Vantage API key not set, skipping REST polling');
        return;
      }

      this.restPoller.register({
        provider: 'alphavantage',
        adapter: async () => {
          const results = [];
          for (const symbol of symbols.commodity) {
            try {
              const response = await fetch(
                `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
              );
              const data = await response.json();
              if (data['Global Quote']) {
                results.push(normaliseAlphaVantage(data));
              }
            } catch (error) {
              console.error(`Failed to poll ${symbol}:`, error);
            }
          }
          return results;
        },
        intervalMs: 30000,
      });

      this.restPoller.start('alphavantage');
    }
  }

  private subscribeToSymbols(symbols: Record<string, string[]>) {
    // Subscribe equities to Alpaca (since it supports equities now)
    if (symbols.equity?.length) {
      this.symbolRegistry.add(symbols.equity[0], 'equity'); // Add one by one for now
    }

    // Subscribe crypto to Binance
    if (symbols.crypto?.length) {
      this.symbolRegistry.add(symbols.crypto[0], 'crypto');
    }

    // Forex could be handled by Alpaca when forex support is added
    // Commodities are handled by REST polling above
  }

  private setupMessageHandlers() {
    // Polygon handler
    this.wsManager.onMessage('polygon', (msg: any) => {
      if (Array.isArray(msg)) {
        msg.forEach(item => {
          if (item.ev === 'T' || item.ev === 'Q') {
            const tick = normalisePolygon(item);
            useTickStore.getState().setTick(tick.symbol, tick);
          }
        });
      }
    });

    // Binance handler
    this.wsManager.onMessage('binance', (msg: any) => {
      if (msg.stream && msg.data) {
        const tick = normaliseBinance(msg.data);
        useTickStore.getState().setTick(tick.symbol, tick);
      }
    });

    // Alpaca handler
    this.wsManager.onMessage('alpaca', (msg: any) => {
      if (Array.isArray(msg)) {
        msg.forEach(item => {
          if (item.T === 't' || item.T === 'q') {
            const tick = normaliseAlpaca(item);
            useTickStore.getState().setTick(tick.symbol, tick);
          }
        });
      }
    });

    // Finnhub handler
    this.wsManager.onMessage('finnhub', (msg: any) => {
      if (Array.isArray(msg.data)) {
        msg.data.forEach((item: any) => {
          const sentiment = normaliseFinnhub(item);
          // Handle sentiment data (could be stored separately)
          console.log('Sentiment:', sentiment);
        });
      }
    });
  }

  private setupStatusCallbacks() {
    const setStatus = useConnectionStatusStore.getState().setStatus;

    Object.keys(PROVIDER_CONFIGS).forEach(provider => {
      this.wsManager.onStatusChange(provider as Provider, (status: any) => {
        setStatus(provider as Provider, status);
      });
    });
  }
}

// Global pipeline instance
export const tickPipeline = new TickPipeline();