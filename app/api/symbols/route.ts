import { NextResponse } from 'next/server';

// Mock symbol universe - in production this would come from a database
const SYMBOL_UNIVERSE = {
  equity: [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX',
    'BABA', 'ORCL', 'CRM', 'AMD', 'INTC', 'UBER', 'SPOT', 'PYPL'
  ],
  crypto: [
    'BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'DOT', 'DOGE', 'AVAX'
  ],
  forex: [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD'
  ],
  commodity: [
    'GC=F', 'SI=F', 'CL=F', 'NG=F' // Gold, Silver, Crude Oil, Natural Gas
  ]
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const market = searchParams.get('market') as keyof typeof SYMBOL_UNIVERSE;

    if (market && SYMBOL_UNIVERSE[market]) {
      return NextResponse.json({
        symbols: SYMBOL_UNIVERSE[market],
        market,
        timestamp: Date.now(),
      });
    }

    // Return all symbols if no market specified
    return NextResponse.json({
      symbols: SYMBOL_UNIVERSE,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error fetching symbols:', error);
    return NextResponse.json({ error: 'Failed to fetch symbols' }, { status: 500 });
  }
}