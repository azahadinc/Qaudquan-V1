import { NextResponse } from 'next/server';
import { useTickStore } from '../../../lib/store/tickStore';

export async function GET() {
  try {
    // Get all ticks from the store
    const ticks = useTickStore.getState().ticks;
    const tickValues = Object.values(ticks);

    // Calculate market breadth from equity symbols
    const equityTicks = tickValues.filter(tick => tick.market === 'equity');

    let advancing = 0;
    let declining = 0;
    let unchanged = 0;

    equityTicks.forEach(tick => {
      if (tick.change > 0) {
        advancing++;
      } else if (tick.change < 0) {
        declining++;
      } else {
        unchanged++;
      }
    });

    const breadth = {
      advancing,
      declining,
      unchanged,
      timestamp: Date.now(),
      total: equityTicks.length,
    };

    return NextResponse.json(breadth);
  } catch (error) {
    console.error('Error calculating market breadth:', error);
    return NextResponse.json({ error: 'Failed to calculate market breadth' }, { status: 500 });
  }
}
