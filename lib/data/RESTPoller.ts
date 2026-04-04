/**
 * REST Poller for providers that don't support WebSocket
 * Handles periodic polling with configurable intervals
 */

import { Provider } from '../../config/providers';

type PollAdapter = () => Promise<any[]>;

interface PollConfig {
  provider: Provider;
  adapter: PollAdapter;
  intervalMs: number;
}

export class RESTPoller {
  private intervals = new Map<Provider, NodeJS.Timeout>();
  private configs = new Map<Provider, PollConfig>();

  /**
   * Register a polling adapter for a provider
   */
  register(config: PollConfig): void {
    this.configs.set(config.provider, config);
  }

  /**
   * Start polling for a provider
   */
  start(provider: Provider): void {
    const config = this.configs.get(provider);
    if (!config) {
      throw new Error(`No config registered for ${provider}`);
    }

    if (this.intervals.has(provider)) {
      this.stop(provider); // Stop existing interval
    }

    const poll = async () => {
      try {
        const data = await config.adapter();
        // Data will be processed by the caller through the adapter
        console.log(`[${provider}] Polled ${data.length} items`);
      } catch (error) {
        console.error(`[${provider}] Poll error:`, error);
        // Continue polling despite errors
      }
    };

    // Initial poll
    poll();

    // Set up interval
    this.intervals.set(provider, setInterval(poll, config.intervalMs));
  }

  /**
   * Stop polling for a provider
   */
  stop(provider: Provider): void {
    const interval = this.intervals.get(provider);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(provider);
    }
  }

  /**
   * Update polling interval for a provider
   */
  setInterval(provider: Provider, intervalMs: number): void {
    const config = this.configs.get(provider);
    if (config) {
      config.intervalMs = intervalMs;
      if (this.intervals.has(provider)) {
        this.stop(provider);
        this.start(provider);
      }
    }
  }

  /**
   * Stop all polling
   */
  destroy(): void {
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals.clear();
    this.configs.clear();
  }
}