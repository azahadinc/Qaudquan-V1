'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { tokens } from '@/config/tokens';

export interface HoldingRow {
  symbol: string;
  market: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
}

interface HoldingsTableProps {
  holdings: HoldingRow[];
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function HoldingsTable({ holdings }: HoldingsTableProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Holdings</h2>
          <p className="text-sm text-text-secondary">Real-time position values and unrealised P&L</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-surface-tertiary text-text-secondary">
              <th className="py-3 pr-6">Symbol</th>
              <th className="py-3 pr-6">Qty</th>
              <th className="py-3 pr-6">Avg Cost</th>
              <th className="py-3 pr-6">Current Price</th>
              <th className="py-3 pr-6">Market Value</th>
              <th className="py-3 pr-6">P&L</th>
              <th className="py-3 pr-6">Return</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-tertiary">
            {holdings.map((holding) => {
              const isPositive = holding.unrealizedPnL >= 0;
              return (
                <tr key={holding.symbol}>
                  <td className="py-4 pr-6">
                    <div className="flex items-center gap-3">
                      <div className="font-semibold">{holding.symbol}</div>
                      <Badge
                        label={holding.market.toUpperCase()}
                        variant={holding.market === 'equity' ? 'primary' : holding.market === 'crypto' ? 'secondary' : 'neutral'}
                        size="sm"
                      />
                    </div>
                  </td>
                  <td className="py-4 pr-6">{holding.quantity.toLocaleString()}</td>
                  <td className="py-4 pr-6">{formatCurrency(holding.averageCost)}</td>
                  <td className="py-4 pr-6">{formatCurrency(holding.currentPrice)}</td>
                  <td className="py-4 pr-6">{formatCurrency(holding.marketValue)}</td>
                  <td className="py-4 pr-6" style={{ color: isPositive ? tokens.colors.up[600] : tokens.colors.down[600] }}>
                    {formatCurrency(holding.unrealizedPnL)}
                  </td>
                  <td className="py-4 pr-6" style={{ color: isPositive ? tokens.colors.up[600] : tokens.colors.down[600] }}>
                    {holding.unrealizedPnLPct.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
