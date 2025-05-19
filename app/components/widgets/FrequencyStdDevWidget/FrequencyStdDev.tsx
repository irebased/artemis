// @ts-nocheck
'use client';

import { useMemo } from 'react';
import { InputData } from '@/app/useDashboardParams';

interface FrequencyStdDevWidgetProps {
  texts: InputData[];
  width?: number;
  height?: number;
  gridH?: number;
}

export const defaultGridSize = { w: 2, h: 2 };

export default function FrequencyStdDevWidget({ texts, width, height, gridH }: FrequencyStdDevWidgetProps) {
  const stdDevs = useMemo(() => {
    return texts.map(input => {
      const freq: Record<string, number> = {};
      const total = input.text.length;
      // Calculate frequencies
      for (const char of input.text) {
        freq[char] = (freq[char] || 0) + 1;
      }
      // Convert to percentages
      const percentages: Record<string, number> = {};
      for (const [char, count] of Object.entries(freq)) {
        percentages[char] = (count / total) * 100;
      }
      // Calculate mean
      const values = Object.values(percentages);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      // Calculate standard deviation
      const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
      const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
      const stdDev = Math.sqrt(variance);
      return {
        text: input.text,
        color: input.color,
        mean,
        stdDev
      };
    });
  }, [texts]);

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-2">Frequency Standard Deviation</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="text-left p-2">Text</th>
              <th className="text-left p-2">Mean Frequency</th>
              <th className="text-left p-2">Standard Deviation</th>
            </tr>
          </thead>
          <tbody>
            {stdDevs.map((r, i) => (
              <tr key={i}>
                <td className="p-2" style={{ color: r.color }}>
                  {r.text.slice(0, 20)}{r.text.length > 20 ? '...' : ''}
                </td>
                <td className="p-2" style={{ color: r.color }}>{r.mean.toFixed(2)}</td>
                <td className="p-2 font-bold text-2xl" style={{ color: r.color }}>{r.stdDev.toFixed(5)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
