/**
 * Symbol Registry
 * Manages the set of subscribed symbols across all providers
 */

import { Market } from '../types';
import { WebSocketManager } from './WebSocketManager';

export class SymbolRegistry {
  private subscribed = new Map<string, Market>();
  private wsManager: WebSocketManager;

  constructor(wsManager: WebSocketManager) {
    this.wsManager = wsManager;
  }

  /**
   * Add a symbol to the registry and subscribe on appropriate provider
   */
  add(symbol: string, market: Market): void {
    if (this.subscribed.has(symbol)) {
      return; // Already subscribed
    }

    this.subscribed.set(symbol, market);
    this.subscribeOnProvider(symbol, market);
  }

  /**
   * Remove a symbol from the registry and unsubscribe
   */
  remove(symbol: string): void {
    if (!this.subscribed.has(symbol)) {
      return;
    }

    const market = this.subscribed.get(symbol)!;
    this.subscribed.delete(symbol);
    this.unsubscribeFromProvider(symbol, market);
  }

  /**
   * Get all subscribed symbols
   */
  getSubscribedSymbols(): string[] {
    return Array.from(this.subscribed.keys());
  }

  /**
   * Get symbols by market
   */
  getSymbolsByMarket(market: Market): string[] {
    return Array.from(this.subscribed.entries())
      .filter(([, symMarket]) => symMarket === market)
      .map(([symbol]) => symbol);
  }

  /**
   * Check if symbol is subscribed
   */
  isSubscribed(symbol: string): boolean {
    return this.subscribed.has(symbol);
  }

  private subscribeOnProvider(symbol: string, market: Market): void {
    switch (market) {
      case 'equity':
        this.wsManager.subscribe('alpaca', [symbol]);
        break;
      case 'crypto':
        this.wsManager.subscribe('binance', [symbol]);
        break;
      case 'forex':
        // Alpaca can handle forex via its streaming APIs, handled separately
        break;
      case 'commodity':
        // Alpha Vantage uses REST polling, handled separately
        break;
    }
  }

  private unsubscribeFromProvider(symbol: string, market: Market): void {
    switch (market) {
      case 'equity':
        this.wsManager.unsubscribe('alpaca', [symbol]);
        break;
      case 'crypto':
        this.wsManager.unsubscribe('binance', [symbol]);
        break;
      case 'forex':
        // Alpaca unsubscription would be handled separately
        break;
      case 'commodity':
        // Alpha Vantage unsubscription handled separately
        break;
    }
  }
}