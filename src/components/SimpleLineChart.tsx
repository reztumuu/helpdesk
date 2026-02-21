'use client';
import React from 'react';

export default function SimpleLineChart({ labels, data, color = '#2563eb' }: { labels: string[]; data: number[]; color?: string }) {
  const width = 600;
  const height = 220;
  const padding = 30;
  const max = Math.max(1, ...data);
  const xStep = (width - padding * 2) / Math.max(1, data.length - 1);
  const points = data.map((v, i) => {
    const x = padding + i * xStep;
    const y = height - padding - (v / max) * (height - padding * 2);
    return `${x},${y}`;
  });
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
      <rect x={0} y={0} width={width} height={height} fill="white" />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="3"
        points={points.join(' ')}
      />
      {data.map((v, i) => {
        const [xStr, yStr] = points[i].split(',');
        const x = parseFloat(xStr);
        const y = parseFloat(yStr);
        return <circle key={i} cx={x} cy={y} r={3} fill={color} />;
      })}
      {labels.map((lab, i) => {
        const x = padding + i * xStep;
        return (
          <text key={lab} x={x} y={height - 8} fontSize="10" textAnchor="middle" fill="#6b7280">
            {lab.slice(5)}
          </text>
        );
      })}
    </svg>
  );
}
