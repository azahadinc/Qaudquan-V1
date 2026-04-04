import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // TODO: Implement real top movers calculation
    // This should find top gainers and losers from all watched symbols
    
    const movers = {
      gainers: [
        { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 875.34, changePct: 5.23 },
        { symbol: 'TSLA', name: 'Tesla Inc', price: 234.56, changePct: 4.78 },
        { symbol: 'MSFT', name: 'Microsoft Corporation', price: 412.89, changePct: 3.45 },
        { symbol: 'AAPL', name: 'Apple Inc', price: 189.45, changePct: 2.89 },
        { symbol: 'AMZN', name: 'Amazon.com Inc', price: 178.23, changePct: 2.34 },
      ],
      losers: [
        { symbol: 'IBM', name: 'International Business Machines', price: 156.78, changePct: -3.45 },
        { symbol: 'KO', name: 'The Coca-Cola Company', price: 64.32, changePct: -2.87 },
        { symbol: 'PG', name: 'Procter & Gamble', price: 165.43, changePct: -2.34 },
        { symbol: 'JNJ', name: 'Johnson & Johnson', price: 156.89, changePct: -1.98 },
        { symbol: 'XOM', name: 'Exxon Mobil Corporation', price: 112.34, changePct: -1.56 },
      ],
      timestamp: Date.now(),
    };

    return NextResponse.json(movers);
  } catch (error) {
    console.error('Error calculating top movers:', error);
    return NextResponse.json({ error: 'Failed to calculate top movers' }, { status: 500 });
  }
}
