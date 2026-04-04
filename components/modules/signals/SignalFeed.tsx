'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface Signal {
  id: string;
  type: 'buy' | 'sell' | 'hold';
  symbol: string;
  message: string;
  timestamp: number;
  confidence: number;
}

interface SignalFeedProps {
  signals: Signal[];
}

export const SignalFeed: React.FC<SignalFeedProps> = ({ signals }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'buy': return 'up';
      case 'sell': return 'down';
      case 'hold': return 'neutral';
      default: return 'primary';
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${minutes}m ago`;
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Signal Feed</h3>
      <div className="space-y-4">
        {signals.map((signal) => (
          <div key={signal.id} className="flex items-start gap-4 p-4 border rounded-lg">
            <Badge label={signal.type.toUpperCase()} variant={getTypeColor(signal.type)} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{signal.symbol}</span>
                <span className="text-sm text-gray-500">
                  {formatTime(signal.timestamp)}
                </span>
                <span className="text-sm text-gray-500">
                  {signal.confidence}% confidence
                </span>
              </div>
              <p className="text-sm text-gray-700">{signal.message}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};