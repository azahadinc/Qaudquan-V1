import { NextResponse } from 'next/server';

const sectors = [
  'Technology', 'Healthcare', 'Financial Services', 'Consumer Cyclical',
  'Communication Services', 'Industrials', 'Consumer Defensive', 'Energy',
  'Utilities', 'Real Estate', 'Materials', 'Basic Materials'
];

const sampleHeatmapData = Array.from({ length: 500 }, (_, i) => ({
  symbol: `STOCK${i + 1}`,
  change: (Math.random() - 0.5) * 20, // -10% to +10%
  sector: sectors[Math.floor(Math.random() * sectors.length)],
}));

export async function GET() {
  try {
    // In a real app, this would fetch from a data provider
    return NextResponse.json(sampleHeatmapData);
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch heatmap data' },
      { status: 500 }
    );
  }
}