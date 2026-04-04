'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { tokens } from '@/config/tokens';

interface SectorRotationProps {
  sectors: Array<{
    name: string;
    changePct: number;
  }>;
}

export const SectorRotation: React.FC<SectorRotationProps> = ({ sectors }: SectorRotationProps) => {
  const maxChange = Math.max(...sectors.map((s) => Math.abs(s.changePct)));

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Sector Rotation</h3>

      <div className="space-y-3">
        {sectors.map((sector) => {
          const isUp = sector.changePct >= 0;
          const percent = maxChange > 0 ? Math.abs(sector.changePct) / maxChange : 0;

          return (
            <div key={sector.name} className="flex items-center gap-3">
              <div className="w-24 text-sm font-medium text-text-secondary">{sector.name}</div>

              <div className="flex-1 h-6 bg-surface-tertiary rounded-lg overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${percent * 100}%`,
                    backgroundColor: isUp ? tokens.colors.up[600] : tokens.colors.down[600],
                  }}
                />
              </div>

              <div className="w-16 text-right">
                <Badge label={`${isUp ? '+' : ''}${sector.changePct.toFixed(2)}%`} variant={isUp ? 'up' : 'down'} size="sm" />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
