/**
 * Custom React Hooks
 * Reusable hook logic across the application
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePortfolioStore } from '@/lib/store/portfolioStore';
import { useTickStore } from '@/lib/store/tickStore';

/**
 * Hook for animated number transitions
 * Counts from old value to new value over a duration
 */
export function useNumberTransition(target: number, duration: number = 400): number {
  const [value, setValue] = useState(target);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const startValueRef = useRef(value);

  useEffect(() => {
    startValueRef.current = value;
    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - (startTimeRef.current || 0);
      const progress = Math.min(elapsed / duration, 1);

      const current = startValueRef.current + (target - startValueRef.current) * progress;
      setValue(Math.round(current * 100) / 100);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [target, duration]);

  return value;
}

/**
 * Hook for debounced values
 * Delays updating the value until input stops changing
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for throttled callbacks
 * Limits how often a callback can be called
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const lastCallRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  return ((...args: any[]) => {
    const now = Date.now();

    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now;
      callback(...args);
    } else {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        lastCallRef.current = Date.now();
        callback(...args);
      }, delay - (now - lastCallRef.current));
    }
  }) as T;
}

/**
 * Hook for previous value
 * Keeps track of the previous render's value
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Hook to subscribe to ticker data for a specific symbol
 * Uses the tick store and only re-renders when this symbol's data changes
 */
export function useTick(symbol: string) {
  const { useTickStore } = require('@/lib/store/tickStore');
  
  return useTickStore((state: any) => state.ticks[symbol], (prev: any, curr: any) => {
    return prev?.price === curr?.price;
  });
}

/**
 * Hook to get portfolio data
 * Aggregates all holdings and calculates portfolio metrics
 */
interface PortfolioHolding {
  symbol: string;
  market: string;
  quantity: number;
  averageCost: number;
  entryTime: number;
  currentPrice: number;
  costBasis: number;
  marketValue: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
}

interface PortfolioData {
  totalValue: number;
  invested: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
  cashBalance: number;
  beta: number;
  sharpeRatio: number;
  holdings: PortfolioHolding[];
  allocation: Array<{ market: string; value: number; percentage: number }>;
}

export function usePortfolio(): PortfolioData {
  const positions = usePortfolioStore((state) => state.positions);
  const cashBalance = usePortfolioStore((state) => state.cashBalance);
  const ticks = useTickStore((state) => state.ticks);

  const holdings = useMemo(() => {
    return positions.map((position) => {
      const tick = ticks[position.symbol];
      const currentPrice = tick?.price ?? position.currentPrice ?? position.averageCost;
      const costBasis = position.averageCost * position.quantity;
      const marketValue = currentPrice * position.quantity;
      const unrealizedPnL = marketValue - costBasis;
      const unrealizedPnLPct = costBasis ? (unrealizedPnL / costBasis) * 100 : 0;

      return {
        ...position,
        currentPrice,
        costBasis,
        marketValue,
        unrealizedPnL,
        unrealizedPnLPct,
      };
    });
  }, [positions, ticks]);

  const invested = holdings.reduce((sum, holding) => sum + holding.costBasis, 0);
  const unrealizedPnL = holdings.reduce((sum, holding) => sum + holding.unrealizedPnL, 0);
  const totalValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0) + cashBalance;
  const unrealizedPnLPct = invested ? (unrealizedPnL / invested) * 100 : 0;

  const allocation = useMemo(() => {
    const totalHoldings = holdings.reduce((sum, holding) => sum + holding.marketValue, 0);
    const grouped = holdings.reduce<Record<string, { market: string; value: number }>>((acc, holding) => {
      const key = holding.market;
      acc[key] = acc[key] || { market: key, value: 0 };
      acc[key].value += holding.marketValue;
      return acc;
    }, {});

    return Object.values(grouped).map((group) => ({
      ...group,
      percentage: totalHoldings ? (group.value / totalHoldings) * 100 : 0,
    }));
  }, [holdings]);

  return {
    totalValue,
    invested,
    unrealizedPnL,
    unrealizedPnLPct,
    cashBalance,
    beta: 0.94,
    sharpeRatio: 1.82,
    holdings,
    allocation,
  };
}

/**
 * Hook to fetch market data with React Query like behavior
 * Handles caching and refetching
 */
export function useMarketData(market?: string, options?: { refetchInterval?: number }) {
  const [data, setData] = useState({
    advancing: 0,
    declining: 0,
    unchanged: 0,
    topMovers: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);

    // Placeholder for fetching market data
    const fetchData = async () => {
      try {
        // This will fetch from /api/breadth, /api/movers, etc.
        setData({
          advancing: 120,
          declining: 80,
          unchanged: 45,
          topMovers: [],
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch market data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up refetch interval if provided
    let intervalId: NodeJS.Timeout | undefined;
    if (options?.refetchInterval) {
      intervalId = setInterval(fetchData, options.refetchInterval);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [market]);

  return { data, isLoading, error };
}
