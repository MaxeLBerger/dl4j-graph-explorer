import type { HistogramBin } from '@/types/model';

interface SparklineProps {
  data: HistogramBin[];
  width: number;
  height: number;
}

export function Sparkline({ data, width, height }: SparklineProps) {
  if (data.length === 0) return null;

  const maxCount = Math.max(...data.map(d => d.count));
  const barWidth = width / data.length;

  return (
    <svg width={width} height={height} className="inline-block">
      {data.map((bin, idx) => {
        const barHeight = maxCount > 0 ? (bin.count / maxCount) * height : 0;
        const x = idx * barWidth;
        const y = height - barHeight;

        return (
          <rect
            key={idx}
            x={x}
            y={y}
            width={Math.max(barWidth - 1, 1)}
            height={barHeight}
            fill="oklch(0.65 0.15 190)"
            opacity={0.8}
          />
        );
      })}
    </svg>
  );
}
