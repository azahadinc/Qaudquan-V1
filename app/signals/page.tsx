'use client';

import React, { useState, useEffect } from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { SignalCard, SignalFeed } from '@/components/modules/signals';

interface Signal {
  id: string;
  type: 'buy' | 'sell' | 'hold';
  symbol: string;
  message: string;
  timestamp: number;
  confidence: number;
}

interface KPIMetric {
  label: string;
  value: number;
  change: number;
}

export default function SignalsPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [kpis, setKpis] = useState<KPIMetric[]>([]);

  useEffect(() => {
    // Fetch signals data
    const fetchSignals = async () => {
      try {
        const response = await fetch('/api/signals');
        const result = await response.json();
        setSignals(result.signals);
        setKpis(result.kpis);
      } catch (error) {
        console.error('Failed to fetch signals data:', error);
      }
    };

    fetchSignals();
  }, []);

  return (
    <PageShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Trading Signals</h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <SignalCard key={kpi.label} kpi={kpi} />
          ))}
        </div>

        {/* Signal Feed */}
        <SignalFeed signals={signals} />
      </div>
    </PageShell>
  );
}