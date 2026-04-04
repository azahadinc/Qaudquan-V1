import { NextResponse } from 'next/server';

// Mock portfolio history data - in production this would calculate from real positions
function generateMockHistory(range: string) {
  const now = Date.now();
  const points = range === '1W' ? 7 : range === '1M' ? 30 : 90;
  const interval = range === '1W' ? 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

  const history = [];
  let value = 100000; // Starting portfolio value

  for (let i = points; i >= 0; i--) {
    const timestamp = now - (i * interval);
    // Add some random variation
    const change = (Math.random() - 0.5) * 2000;
    value += change;

    history.push({
      timestamp,
      value: Math.max(0, value),
      change: change,
      changePct: (change / (value - change)) * 100,
    });
  }

  return history;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '1W'; // 1W, 1M, 3M

    const history = generateMockHistory(range);

    return NextResponse.json({
      history,
      range,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error fetching portfolio history:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio history' }, { status: 500 });
  }
}