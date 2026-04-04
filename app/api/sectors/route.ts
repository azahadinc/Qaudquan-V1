import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // TODO: Implement real sector rotation calculation
    // This should aggregate by sector and calculate weighted performance
    
    const sectors = [
      { name: 'Technology', changePct: 2.34 },
      { name: 'Healthcare', changePct: 1.23 },
      { name: 'Financials', changePct: 0.87 },
      { name: 'Energy', changePct: -0.45 },
      { name: 'Utilities', changePct: -1.22 },
      { name: 'Consumer', changePct: 0.56 },
      { name: 'Industrials', changePct: 1.78 },
      { name: 'Materials', changePct: -0.32 },
    ];

    return NextResponse.json({ sectors, timestamp: Date.now() });
  } catch (error) {
    console.error('Error calculating sector rotation:', error);
    return NextResponse.json({ error: 'Failed to calculate sector rotation' }, { status: 500 });
  }
}
