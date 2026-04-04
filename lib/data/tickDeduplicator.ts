/**
 * Tick Deduplicator
 * Prevents processing of duplicate ticks within a time window
 */

export class TickDeduplicator {
  private seenTicks = new Map<string, number>(); // symbol_timestamp -> timestamp
  private readonly windowMs = 100; // 100ms deduplication window

  /**
   * Check if a tick is a duplicate
   */
  isDuplicate(symbol: string, timestamp: number): boolean {
    const key = `${symbol}_${timestamp}`;
    const lastSeen = this.seenTicks.get(key);

    if (lastSeen && (Date.now() - lastSeen) < this.windowMs) {
      return true; // Duplicate within window
    }

    // Update last seen time
    this.seenTicks.set(key, Date.now());

    // Clean up old entries (older than window)
    for (const [k, time] of this.seenTicks.entries()) {
      if (Date.now() - time > this.windowMs) {
        this.seenTicks.delete(k);
      }
    }

    return false;
  }

  /**
   * Clear all deduplication state
   */
  clear(): void {
    this.seenTicks.clear();
  }
}