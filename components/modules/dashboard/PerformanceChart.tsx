'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { tokens } from '@/config/tokens';

interface ChartDataPoint {
  timestamp: number;
  value: number;
}

export interface PerformanceChartProps {
  data: ChartDataPoint[];
  title?: string;
  timeframe?: '1D' | '1W' | '1M' | '3M' | '1Y';
  onTimeframeChange?: (timeframe: '1D' | '1W' | '1M' | '3M' | '1Y') => void;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  title = 'Portfolio Performance',
  timeframe = '1D',
  onTimeframeChange,
}: PerformanceChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    // Clear canvas
    ctx.fillStyle = tokens.colors.surface.variant;
    ctx.fillRect(0, 0, width, height);

    // Find min and max values
    const values = data.map((d) => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;

    // Draw grid
    ctx.strokeStyle = tokens.colors.surfaceVariant.border;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + ((height - 2 * padding) * i) / 5;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw line chart
    const xStep = (width - 2 * padding) / (data.length - 1 || 1);
    ctx.strokeStyle = tokens.colors.primary[600];
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((point, index) => {
      const x = padding + index * xStep;
      const y = height - padding - ((point.value - minValue) / range) * (height - 2 * padding);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw hovered point
    if (hoveredIndex !== null && hoveredIndex < data.length) {
      const x = padding + hoveredIndex * xStep;
      const y = height - padding - ((data[hoveredIndex].value - minValue) / range) * (height - 2 * padding);

      ctx.fillStyle = tokens.colors.primary[600];
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [data, hoveredIndex]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || data.length === 0) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const xStep = (canvasRef.current.width - 80) / (data.length - 1 || 1);
    const index = Math.round((x - 40) / xStep);

    if (index >= 0 && index < data.length) {
      setHoveredIndex(index);
    }
  };

  const handleCanvasMouseLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex gap-2">
          {(['1D', '1W', '1M', '3M', '1Y'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange?.(tf)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                timeframe === tf ? 'bg-primary text-white' : 'bg-surface-tertiary text-text-secondary hover:text-text-primary'
              }`}
              style={{
                backgroundColor: timeframe === tf ? tokens.colors.primary[600] : undefined,
              }}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={300}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={handleCanvasMouseLeave}
        className="w-full border border-surface-tertiary rounded-lg cursor-crosshair"
        style={{ borderColor: tokens.colors.surfaceVariant.border }}
      />

      {hoveredIndex !== null && hoveredIndex < data.length && (
        <div className="mt-4 text-sm text-text-secondary">
          <p>
            {new Date(data[hoveredIndex].timestamp).toLocaleDateString()}: ${data[hoveredIndex].value.toFixed(2)}
          </p>
        </div>
      )}
    </Card>
  );
};
