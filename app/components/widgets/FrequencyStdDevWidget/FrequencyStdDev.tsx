// @ts-nocheck
'use client';

import { Ciphertext } from '@/types/ciphertext';
import { useFrequencyStdDev, defaultGridSize } from './useFrequencyStdDev';

interface FrequencyStdDevWidgetProps {
  inputs: Ciphertext[];
  width?: number;
  height?: number;
  gridH?: number;
}

export default function FrequencyStdDevWidget({ inputs, width, height, gridH }: FrequencyStdDevWidgetProps) {
  const stdDevs = useFrequencyStdDev(inputs);

  if (!stdDevs) return null;

  return (
    <div className="w-full h-full flex flex-col">
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
                  <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: r.color, display: 'inline-block' }} />
                  {r.text.slice(0, 7)}{r.text.length > 7 ? '...' : ''}
                </td>
                <td className="p-2 text-gray-400">{r.mean.toFixed(2)}</td>
                <td className="p-2 font-bold text-gray-400">{r.stdDev.toFixed(5)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
