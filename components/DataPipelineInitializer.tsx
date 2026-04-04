'use client';

import { useEffect } from 'react';
import { tickPipeline } from '../workers/tickPipeline';

export function DataPipelineInitializer() {
  useEffect(() => {
    // Initialize with some default symbols
    const defaultSymbols = {
      equity: ['AAPL', 'MSFT', 'GOOGL'],
      crypto: ['BTC', 'ETH'],
      forex: ['EUR/USD'],
      commodity: ['GC=F'],
    };

    tickPipeline.initialize(defaultSymbols);

    // Cleanup on unmount
    return () => {
      tickPipeline.shutdown();
    };
  }, []);

  return null; // This component doesn't render anything
}