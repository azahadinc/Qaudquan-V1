import { NextResponse } from 'next/server';
import { useTickStore } from '../../../lib/store/tickStore';

export async function GET() {
  try {
    // Get all ticks from the store
    const ticks = useTickStore.getState().ticks;
    const tickValues = Object.values(ticks);

    // Separate gainers and losers
    const gainers = tickValues
      .filter(tick => tick.changePct > 0)
      .sort((a, b) => b.changePct - a.changePct)
      .slice(0, 5)
      .map(tick => ({
        symbol: tick.symbol,
        name: tick.symbol, // TODO: Add name lookup
        price: tick.price,
        changePct: tick.changePct,
      }));

    const losers = tickValues
      .filter(tick => tick.changePct < 0)
      .sort((a, b) => a.changePct - b.changePct)
      .slice(0, 5)
      .map(tick => ({
        symbol: tick.symbol,
        name: tick.symbol, // TODO: Add name lookup
        price: tick.price,
        changePct: tick.changePct,
      }));

    const movers = {
      gainers,
      losers,
      timestamp: Date.now(),
    };

    return NextResponse.json(movers);
  } catch (error) {
    console.error('Error calculating top movers:', error);
    return NextResponse.json({ error: 'Failed to calculate top movers' }, { status: 500 });
  }
}
