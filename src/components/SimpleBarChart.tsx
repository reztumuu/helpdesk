'use client';
import React from 'react';

export default function SimpleBarChart({ labels, data, color = '#10b981' }: { labels: string[]; data: number[]; color?: string }) {
  const max = Math.max(1, ...data);
  return (
    <div className="w-full h-56 flex items-end gap-2 px-4">
      {data.map((v, i) => (
        <div key={i} className="flex flex-col items-center justify-end" style={{ width: `${100 / data.length}%` }}>
          <div
            className="rounded-t"
            style={{
              height: `${(v / max) * 100}%`,
              backgroundColor: color,
              width: '80%'
            }}
          />
          <span className="text-[10px] mt-1 text-gray-500">{labels[i].slice(5)}</span>
        </div>
      ))}
    </div>
  );
}
