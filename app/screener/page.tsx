'use client';

import { useMemo, useState } from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { ScreenerFilterBar, ScreenerTable, type ScreenerRow } from '@/components/modules/screener';

const screenerData: ScreenerRow[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc',
    market: 'equity',
    price: 189.45,
    changePct: 2.84,
    volume: 82_450_000,
    marketCap: 2_450_000_000_000,
    rsi: 68,
    macd: 1.12,
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    market: 'equity',
    price: 412.89,
    changePct: 3.08,
    volume: 21_800_000,
    marketCap: 2_100_000_000_000,
    rsi: 63,
    macd: 0.98,
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    market: 'crypto',
    price: 68_500,
    changePct: 4.12,
    volume: 35_200_000_000,
    marketCap: 1_360_000_000_000,
    rsi: 72,
    macd: 1.34,
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    market: 'crypto',
    price: 3_450,
    changePct: 2.15,
    volume: 18_000_000_000,
    marketCap: 420_000_000_000,
    rsi: 66,
    macd: 0.78,
  },
  {
    symbol: 'EURUSD',
    name: 'Euro / US Dollar',
    market: 'forex',
    price: 1.0824,
    changePct: -0.12,
    volume: 5_900_000,
    marketCap: 0,
    rsi: 52,
    macd: -0.05,
  },
  {
    symbol: 'XOM',
    name: 'Exxon Mobil',
    market: 'equity',
    price: 112.34,
    changePct: -1.56,
    volume: 14_300_000,
    marketCap: 470_000_000_000,
    rsi: 45,
    macd: -0.18,
  },
  {
    symbol: 'USO',
    name: 'United States Oil Fund',
    market: 'commodity',
    price: 58.71,
    changePct: 0.84,
    volume: 8_400_000,
    marketCap: 7_200_000_000,
    rsi: 58,
    macd: 0.12,
  },
];

export default function ScreenerPage() {
  const [market, setMarket] = useState<'all' | 'equity' | 'crypto' | 'forex' | 'commodity'>('all');
  const [query, setQuery] = useState('');

  const filteredRows = useMemo(() => {
    return screenerData.filter((row) => {
      const matchesMarket = market === 'all' || row.market === market;
      const matchesQuery = query.trim() === '' || [row.symbol, row.name].some((value) =>
        value.toLowerCase().includes(query.trim().toLowerCase()),
      );
      return matchesMarket && matchesQuery;
    });
  }, [market, query]);

  return (
    <PageShell>
      <div className="space-y-6">
        <ScreenerFilterBar
          market={market}
          query={query}
          onMarketChange={(value) => setMarket(value as typeof market)}
          onQueryChange={setQuery}
          onReset={() => {
            setMarket('all');
            setQuery('');
          }}
        />

        <ScreenerTable rows={filteredRows} />
      </div>
    </PageShell>
  );
}
