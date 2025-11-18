import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { HistogramBin } from '@/types/model';

interface HistogramChartProps {
  data: HistogramBin[];
}

export function HistogramChart({ data }: HistogramChartProps) {
  const chartData = data.map((bin, idx) => ({
    bin: idx,
    count: bin.count,
    range: `${bin.min.toFixed(3)} to ${bin.max.toFixed(3)}`,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <XAxis 
          dataKey="bin" 
          tick={{ fontSize: 10, fill: 'oklch(0.45 0.02 250)' }}
          stroke="oklch(0.85 0.01 250)"
        />
        <YAxis 
          tick={{ fontSize: 10, fill: 'oklch(0.45 0.02 250)' }}
          stroke="oklch(0.85 0.01 250)"
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'oklch(1 0 0)',
            border: '1px solid oklch(0.85 0.01 250)',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          labelStyle={{ color: 'oklch(0.15 0.02 250)', fontWeight: 600 }}
        />
        <Bar 
          dataKey="count" 
          fill="oklch(0.65 0.15 190)" 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
