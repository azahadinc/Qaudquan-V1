/**
 * Market Feed Hook
 * Provides access to live market data feeds
 */

import { useEffect } from 'react';
import { SymbolRegistry } from '../lib/data/SymbolRegistry';
import { WebSocketManager } from '../lib/data/WebSocketManager';
import { RESTPoller } from '../lib/data/RESTPoller';
import { Market } from '../lib/types';

// Global instances (should be initialized once at app startup)
let wsManager: WebSocketManager | null = null;
let restPoller: RESTPoller | null = null;
let symbolRegistry: SymbolRegistry | null = null;

export function initializeMarketFeed() {
  if (!wsManager) {
    wsManager = new WebSocketManager();
    restPoller = new RESTPoller();
    symbolRegistry = new SymbolRegistry(wsManager);
  }
}

export function useMarketFeed(symbol: string, market: Market) {
  useEffect(() => {
    if (!symbolRegistry) {
      console.warn('Market feed not initialized');
      return;
    }

    // Add symbol to registry (this will subscribe on appropriate provider)
    symbolRegistry.add(symbol, market);

    // Cleanup function to unsubscribe
    return () => {
      symbolRegistry?.remove(symbol);
    };
  }, [symbol, market]);

  return {
    subscribe: (symbol: string, market: Market) => symbolRegistry?.add(symbol, market),
    unsubscribe: (symbol: string) => symbolRegistry?.remove(symbol),
  };
}

export function getMarketFeedManager() {
  return {
    wsManager,
    restPoller,
    symbolRegistry,
  };
}