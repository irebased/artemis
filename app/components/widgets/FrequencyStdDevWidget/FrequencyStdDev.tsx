// @ts-nocheck
'use client';

import { InputData } from '@/app/useDashboardParams';
import { useFrequencyStdDev, defaultGridSize } from './useFrequencyStdDev';

interface FrequencyStdDevWidgetProps {
  texts: InputData[];
  width?: number;
  height?: number;
  gridH?: number;
}

export default function FrequencyStdDevWidget({ texts, width, height, gridH }: FrequencyStdDevWidgetProps) {
  const stdDevs = useFrequencyStdDev(texts);

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
