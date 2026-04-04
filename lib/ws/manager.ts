/**
 * WebSocket Manager
 * Handles real-time data connections with automatic reconnection
 */

interface WSConfig {
  url: string;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 5;
  private reconnectDelay = 3000;
  private currentAttempt = 0;
  private messageQueue: string[] = [];
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor(config: WSConfig) {
    this.url = config.url;
    if (config.reconnectAttempts !== undefined) {
      this.reconnectAttempts = config.reconnectAttempts;
    }
    if (config.reconnectDelay !== undefined) {
      this.reconnectDelay = config.reconnectDelay;
    }
  }

  /**
   * Connect to WebSocket
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('[WebSocket] Connected');
          this.currentAttempt = 0;
          this.flushMessageQueue();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.emit('message', data);
          } catch (error) {
            console.error('[WebSocket] Parse error:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[WebSocket] Disconnected');
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Send message through WebSocket
   */
  send(message: any): void {
    const jsonMessage = JSON.stringify(message);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(jsonMessage);
    } else {
      this.messageQueue.push(jsonMessage);
    }
  }

  /**
   * Subscribe to events
   */
  on(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Emit events to listeners
   */
  private emit(event: string, data: any): void {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[WebSocket] Listener error for "${event}":`, error);
      }
    });
  }

  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift();
      if (message) {
        this.ws.send(message);
      }
    }
  }

  /**
   * Attempt reconnection with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.currentAttempt < this.reconnectAttempts) {
      this.currentAttempt++;
      const delay = this.reconnectDelay * Math.pow(1.5, this.currentAttempt - 1);
      console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.currentAttempt}/${this.reconnectAttempts})`);

      setTimeout(() => {
        this.connect().catch((error) => {
          console.error('[WebSocket] Reconnection failed:', error);
        });
      }, delay);
    } else {
      console.error('[WebSocket] Max reconnection attempts reached');
      this.emit('fatal', { message: 'Failed to reconnect after max attempts' });
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
