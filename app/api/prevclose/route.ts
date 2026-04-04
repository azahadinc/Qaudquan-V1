import { NextResponse } from 'next/server';

// Mock previous close prices - in production this would fetch from providers
const MOCK_PREV_CLOSES: Record<string, number> = {
  // Equities
  'AAPL': 189.45,
  'MSFT': 412.89,
  'GOOGL': 142.56,
  'AMZN': 178.23,
  'TSLA': 234.56,
  'NVDA': 875.34,
  'META': 484.23,
  'NFLX': 567.89,

  // Crypto
  'BTC': 45123.45,
  'ETH': 2456.78,
  'BNB': 312.45,
  'ADA': 0.45,
  'SOL': 98.76,

  // Forex
  'EUR/USD': 1.0845,
  'GBP/USD': 1.2745,
  'USD/JPY': 147.23,
  'USD/CHF': 0.8765,

  // Commodities
  'GC=F': 1987.65, // Gold
  'SI=F': 23.45,   // Silver
  'CL=F': 78.90,   // Crude Oil
  'NG=F': 2.34,    // Natural Gas
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get('symbols')?.split(',') || [];

    if (symbols.length === 0) {
      return NextResponse.json({ error: 'No symbols provided' }, { status: 400 });
    }

    const result: Record<string, number> = {};

    symbols.forEach(symbol => {
      const prevClose = MOCK_PREV_CLOSES[symbol];
      if (prevClose !== undefined) {
        result[symbol] = prevClose;
      }
    });

    return NextResponse.json({
      prevCloses: result,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error fetching previous closes:', error);
    return NextResponse.json({ error: 'Failed to fetch previous closes' }, { status: 500 });
  }
}