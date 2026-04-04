'use client';

import React, { useMemo, useState } from 'react';
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { tokens } from '@/config/tokens';

export interface ScreenerRow {
  symbol: string;
  name: string;
  market: 'equity' | 'crypto' | 'forex' | 'commodity';
  price: number;
  changePct: number;
  volume: number;
  marketCap: number;
  rsi: number;
  macd: number;
}

interface ScreenerTableProps {
  rows: ScreenerRow[];
}

const columnHelper = createColumnHelper<ScreenerRow>();

export const ScreenerTable: React.FC<ScreenerTableProps> = ({ rows }: ScreenerTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<ScreenerRow, any>[]>(
    () => [
      columnHelper.accessor('symbol', {
        header: 'Symbol',
        cell: (info) => <span className="font-semibold text-text-primary">{info.getValue()}</span>,
      }),
      columnHelper.accessor('name', {
        header: 'Name',
      }),
      columnHelper.accessor('market', {
        header: 'Market',
      }),
      columnHelper.accessor('price', {
        header: 'Price',
        cell: (info) => `$${info.getValue().toFixed(2)}`,
      }),
      columnHelper.accessor('changePct', {
        header: 'Change',
        cell: (info) => {
          const value = info.getValue();
          const isUp = value >= 0;
          return (
            <Badge
              label={`${isUp ? '+' : ''}${value.toFixed(2)}%`}
              variant={isUp ? 'up' : 'down'}
              size="sm"
            />
          );
        },
      }),
      columnHelper.accessor('volume', {
        header: 'Volume',
        cell: (info) => info.getValue().toLocaleString(),
      }),
      columnHelper.accessor('marketCap', {
        header: 'Market Cap',
        cell: (info) => `$${(info.getValue() / 1_000_000_000).toFixed(1)}B`,
      }),
      columnHelper.accessor('rsi', {
        header: 'RSI',
      }),
      columnHelper.accessor('macd', {
        header: 'MACD',
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Screener results</h3>
          <p className="text-sm text-text-secondary">Sortable universe of instruments with key technical metrics.</p>
        </div>
        <div className="text-sm text-text-secondary">{rows.length} results</div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border-separate border-spacing-0">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-left py-3 px-3 font-semibold text-text-secondary border-b"
                    style={{ borderColor: tokens.colors.surfaceVariant.border }}
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        className="inline-flex items-center gap-2"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{ asc: '↑', desc: '↓' }[header.column.getIsSorted() as string] ?? ''}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b last:border-b-0" style={{ borderColor: tokens.colors.surfaceVariant.border }}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-3 px-3 align-top text-text-primary">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
