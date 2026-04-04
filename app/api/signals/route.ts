import { NextResponse } from 'next/server';

const sampleSignals = [
  {
    id: '1',
    type: 'buy' as const,
    symbol: 'AAPL',
    message: 'Strong momentum detected with RSI crossing above 70',
    timestamp: Date.now() - 3600000, // 1 hour ago
    confidence: 85,
  },
  {
    id: '2',
    type: 'sell' as const,
    symbol: 'TSLA',
    message: 'Bearish divergence in MACD histogram',
    timestamp: Date.now() - 7200000, // 2 hours ago
    confidence: 78,
  },
  {
    id: '3',
    type: 'hold' as const,
    symbol: 'MSFT',
    message: 'Consolidation phase, wait for breakout',
    timestamp: Date.now() - 10800000, // 3 hours ago
    confidence: 65,
  },
  {
    id: '4',
    type: 'buy' as const,
    symbol: 'NVDA',
    message: 'Volume spike with price breakout',
    timestamp: Date.now() - 14400000, // 4 hours ago
    confidence: 92,
  },
];

const sampleKPIs = [
  {
    label: 'Active Signals',
    value: 24,
    change: 12,
  },
  {
    label: 'Success Rate',
    value: 78.5,
    change: 5.2,
  },
  {
    label: 'Avg Confidence',
    value: 82.3,
    change: -2.1,
  },
  {
    label: 'Total Alerts',
    value: 156,
    change: 23,
  },
];

export async function GET() {
  try {
    // In a real app, this would run signal detection algorithms
    return NextResponse.json({
      signals: sampleSignals,
      kpis: sampleKPIs,
    });
  } catch (error) {
    console.error('Error fetching signals data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch signals data' },
      { status: 500 }
    );
  }
}