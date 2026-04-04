/**
 * WebSocket Manager for multiple data providers
 * Manages persistent WebSocket connections with automatic reconnection
 */

import { PROVIDER_CONFIGS, Provider, ConnectionStatus } from '../../config/providers';
import { useSettingsStore } from '../../store/settingsStore';

type ConnectionState = {
  ws: WebSocket | null;
  status: ConnectionStatus;
  reconnectAttempts: number;
  subscriptions: Set<string>;
  heartbeatInterval?: NodeJS.Timeout;
  reconnectTimeout?: NodeJS.Timeout;
};

export class WebSocketManager {
  private connections = new Map<Provider, ConnectionState>();
  private handlers = new Map<Provider, (msg: unknown) => void>();
  private statusCallbacks = new Map<Provider, (status: ConnectionStatus) => void>();

  constructor() {
    // Initialize connection states for all providers
    Object.keys(PROVIDER_CONFIGS).forEach((provider) => {
      this.connections.set(provider as Provider, {
        ws: null,
        status: 'connecting',
        reconnectAttempts: 0,
        subscriptions: new Set(),
      });
    });
  }

  /**
   * Connect to a provider's WebSocket
   */
  async connect(provider: Provider): Promise<void> {
    const config = PROVIDER_CONFIGS[provider];
    if (!config.isWebSocket) {
      throw new Error(`${provider} is not a WebSocket provider`);
    }

    const state = this.connections.get(provider)!;
    if (state.ws?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    state.status = 'connecting';
    this.notifyStatusChange(provider, 'connecting');

    return new Promise((resolve, reject) => {
      try {
        const apiKey = useSettingsStore.getState().getApiKey(provider);
        if (config.authRequired && !apiKey) {
          state.status = 'error';
          this.notifyStatusChange(provider, 'error');
          reject(new Error(`API key required for ${provider}`));
          return;
        }
        const url = config.authRequired && apiKey
          ? `${config.url}?token=${apiKey}`
          : config.url;

        state.ws = new WebSocket(url);

        state.ws.onopen = () => {
          console.log(`[${provider}] Connected`);
          state.status = 'connected';
          state.reconnectAttempts = 0;
          this.notifyStatusChange(provider, 'connected');

          // Send authentication if required
          if (config.authRequired && apiKey) {
            this.sendAuth(provider);
          }

          // Start heartbeat
          this.startHeartbeat(provider);

          // Re-subscribe to all symbols
          if (state.subscriptions.size > 0) {
            this.subscribe(provider, Array.from(state.subscriptions));
          }

          resolve();
        };

        state.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handlers.get(provider)?.(data);
          } catch (error) {
            console.error(`[${provider}] Parse error:`, error);
          }
        };

        state.ws.onerror = (error) => {
          console.error(`[${provider}] Error:`, error);
          state.status = 'error';
          this.notifyStatusChange(provider, 'error');
          reject(error);
        };

        state.ws.onclose = () => {
          console.log(`[${provider}] Disconnected`);
          this.stopHeartbeat(provider);
          this.attemptReconnect(provider);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Subscribe to symbols on a provider
   */
  subscribe(provider: Provider, symbols: string[]): void {
    const state = this.connections.get(provider)!;
    symbols.forEach(symbol => state.subscriptions.add(symbol));

    if (state.status !== 'connected') {
      return; // Will subscribe when connection is established
    }

    const message = this.buildSubscribeMessage(provider, symbols);
    if (message) {
      state.ws?.send(JSON.stringify(message));
    }
  }

  /**
   * Unsubscribe from symbols
   */
  unsubscribe(provider: Provider, symbols: string[]): void {
    const state = this.connections.get(provider)!;
    symbols.forEach(symbol => state.subscriptions.delete(symbol));

    if (state.status !== 'connected') {
      return;
    }

    const message = this.buildUnsubscribeMessage(provider, symbols);
    if (message) {
      state.ws?.send(JSON.stringify(message));
    }
  }

  /**
   * Register message handler for a provider
   */
  onMessage(provider: Provider, handler: (msg: unknown) => void): void {
    this.handlers.set(provider, handler);
  }

  /**
   * Register status change callback
   */
  onStatusChange(provider: Provider, callback: (status: ConnectionStatus) => void): void {
    this.statusCallbacks.set(provider, callback);
  }

  /**
   * Reconnect to a provider (disconnect first if connected)
   */
  async reconnect(provider: Provider): Promise<void> {
    const state = this.connections.get(provider)!;
    if (state.ws) {
      state.ws.close();
      state.ws = null;
    }
    this.stopHeartbeat(provider);
    await this.connect(provider);
  }

  /**
   * Destroy all connections
   */
  destroy(): void {
    this.connections.forEach((state, provider) => {
      this.stopHeartbeat(provider);
      if (state.reconnectTimeout) {
        clearTimeout(state.reconnectTimeout);
      }
      state.ws?.close();
    });
    this.connections.clear();
    this.handlers.clear();
    this.statusCallbacks.clear();
  }

  private sendAuth(provider: Provider): void {
    const state = this.connections.get(provider)!;
    const apiKey = useSettingsStore.getState().getApiKey(provider);

    if (provider === 'polygon') {
      state.ws?.send(JSON.stringify({
        action: 'auth',
        params: apiKey,
      }));
    } else if (provider === 'alpaca') {
      // Alpaca requires key and secret, but for now assume apiKey contains both or just key
      // TODO: Update settings to handle key/secret separately
      const [key, secret] = apiKey?.split(':') || ['', ''];
      state.ws?.send(JSON.stringify({
        action: 'auth',
        key: key || apiKey,
        secret: secret || '',
      }));
    } else if (provider === 'finnhub') {
      // Finnhub auth is in URL, but may need additional handshake
    }
  }

  private buildSubscribeMessage(provider: Provider, symbols: string[]): any {
    switch (provider) {
      case 'polygon':
        return {
          action: 'subscribe',
          params: symbols.map(s => `T.${s},Q.${s}`).join(','),
        };
      case 'alpaca':
        return {
          action: 'subscribe',
          trades: symbols,
          quotes: symbols,
        };
      case 'binance':
        return {
          method: 'SUBSCRIBE',
          params: symbols.map(s => `${s.toLowerCase()}@ticker`),
          id: Date.now(),
        };
      case 'finnhub':
        return {
          type: 'subscribe',
          symbol: symbols.join(','),
        };
      default:
        return null;
    }
  }

  private buildUnsubscribeMessage(provider: Provider, symbols: string[]): any {
    switch (provider) {
      case 'polygon':
        return {
          action: 'unsubscribe',
          params: symbols.map(s => `T.${s},Q.${s}`).join(','),
        };
      case 'alpaca':
        return {
          action: 'unsubscribe',
          trades: symbols,
          quotes: symbols,
        };
      case 'binance':
        return {
          method: 'UNSUBSCRIBE',
          params: symbols.map(s => `${s.toLowerCase()}@ticker`),
          id: Date.now(),
        };
      case 'finnhub':
        return {
          type: 'unsubscribe',
          symbol: symbols.join(','),
        };
      default:
        return null;
    }
  }

  private startHeartbeat(provider: Provider): void {
    const state = this.connections.get(provider)!;
    state.heartbeatInterval = setInterval(() => {
      if (state.ws?.readyState === WebSocket.OPEN) {
        // Send provider-specific heartbeat
        if (provider === 'polygon') {
          state.ws.send(JSON.stringify({ action: 'heartbeat' }));
        } else {
          // For other providers, we'll rely on connection monitoring
          // In a real implementation, you might send protocol-specific pings
        }
      }
    }, 30000); // 30 seconds
  }

  private stopHeartbeat(provider: Provider): void {
    const state = this.connections.get(provider)!;
    if (state.heartbeatInterval) {
      clearInterval(state.heartbeatInterval);
      state.heartbeatInterval = undefined;
    }
  }

  private attemptReconnect(provider: Provider): void {
    const state = this.connections.get(provider)!;
    if (state.reconnectAttempts >= 5) {
      state.status = 'error';
      this.notifyStatusChange(provider, 'error');
      return;
    }

    state.status = 'reconnecting';
    this.notifyStatusChange(provider, 'reconnecting');
    state.reconnectAttempts++;

    const delay = Math.min(1000 * Math.pow(2, state.reconnectAttempts - 1), 30000);
    state.reconnectTimeout = setTimeout(() => {
      this.connect(provider).catch((error) => {
        console.error(`[${provider}] Reconnection failed:`, error);
      });
    }, delay);
  }

  private notifyStatusChange(provider: Provider, status: ConnectionStatus): void {
    this.statusCallbacks.get(provider)?.(status);
  }
}