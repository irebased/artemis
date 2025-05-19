import { useEffect, useMemo, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  BarElement,
  Title,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import annotationPlugin from 'chartjs-plugin-annotation';
import { useIndexOfCoincidenceChart } from './useIndexOfCoincidenceChart';
import { InputData } from '@/app/useDashboardParams';
import { BaseType } from '@/types/bases';

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartDataLabels,
  annotationPlugin,
  BarElement,
  Title
);

const IC_BASELINES = {
  ascii: { english: 0.065, random: 0.01805 },
  base64: { english: 0.02811, random: 0.01387 },
  hex: { english: 0.13985, random: 0.05714 },
  decimal: { english: 0.25448, random: 0.09769 },
  octal: { english: 0.20402, random: 0.12121 },
} as const;

function computeIC(text: string): number {
  if (!text || text.length < 2) return 0;
  const freq: Record<string, number> = {};
  for (const char of text) {
    freq[char] = (freq[char] || 0) + 1;
  }
  const total = text.length;
  const numerator = Object.values(freq).reduce((acc, f) => acc + f * (f - 1), 0);
  const denominator = total * (total - 1);
  return denominator > 0 ? numerator / denominator : 0;
}

function analyzePeriodIC(
  text: string,
  maxPeriod: number,
  langIC: number
): { period: number; averageIC: number }[] {
  const n = text.length;
  const results: { period: number; averageIC: number }[] = [];

  for (let period = 1; period <= maxPeriod; period++) {
    const groups: string[] = Array.from({ length: period }, () => '');

    for (let i = 0; i < n; i++) {
      groups[i % period] += text[i];
    }

    const avgIC = groups.reduce((sum, group) => sum + computeIC(group), 0) / groups.length;
    results.push({ period, averageIC: avgIC });
  }

  return results;
}

interface IndexOfCoincidenceWidgetProps {
  texts: InputData[];
  base: BaseType;
  width?: number;
  height?: number;
  view: 'summary' | 'period';
  onViewChange: (view: 'summary' | 'period') => void;
}

export const defaultGridSize = { w: 2, h: 2 };

export default function IndexOfCoincidenceWidget({
  texts,
  base,
  width,
  height,
  view,
  onViewChange,
}: IndexOfCoincidenceWidgetProps) {
  // Baseline values
  const baseline = IC_BASELINES[base];

  // Calculate results for each input
  const results = useMemo(() => {
    return texts.map(input => {
      const text = input.text;
      const n = text.length;
      if (n < 2) return { text, color: input.color, ic: 0, periodics: [], total: n, unique: 0 };
      // Calculate character frequencies
      const freq: Record<string, number> = {};
      for (const char of text) {
        freq[char] = (freq[char] || 0) + 1;
      }
      // Calculate IC
      const sum = Object.values(freq).reduce((acc, count) => acc + count * (count - 1), 0);
      const ic = sum / (n * (n - 1));
      // Calculate periodic ICs (up to period 20)
      const periodics = [];
      for (let period = 2; period <= Math.min(20, Math.floor(n / 2)); period++) {
        const groups: string[][] = Array.from({ length: period }, () => []);
        for (let i = 0; i < n; i++) {
          groups[i % period].push(text[i]);
        }
        const groupICs = groups.map(group => {
          const groupFreq: Record<string, number> = {};
          for (const char of group) {
            groupFreq[char] = (groupFreq[char] || 0) + 1;
          }
          const groupN = group.length;
          if (groupN < 2) return 0;
          const groupSum = Object.values(groupFreq).reduce((acc, count) => acc + count * (count - 1), 0);
          return groupSum / (groupN * (groupN - 1));
        });
        const avgIC = groupICs.reduce((a, b) => a + b, 0) / groupICs.length;
        periodics.push({ period, ic: avgIC });
      }
      return {
        text,
        color: input.color,
        ic,
        periodics,
        total: n,
        unique: Object.keys(freq).length,
      };
    });
  }, [texts, base]);

  // Use chart hook for chart data and options
  const { data: periodLineData, options: lineOptions } = useIndexOfCoincidenceChart(results, view, baseline);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4 flex flex-row items-center justify-between gap-2">
        <h3 className="text-lg font-semibold mb-0">Index of Coincidence</h3>
        <div>
          <label className="mr-2">View:</label>
          <select
            value={view}
            onChange={(e) => onViewChange(e.target.value as 'summary' | 'period')}
            className="p-2 border rounded"
          >
            <option value="summary">Summary</option>
            <option value="period">Periodic Analysis</option>
          </select>
        </div>
      </div>
      {view === 'summary' ? (
        <div className="overflow-x-auto">
          <div className="flex gap-8 mb-2 text-gray-400">
            <span>English avg: <span className="font-mono">{baseline.english.toFixed(5)}</span></span>
            <span>Random avg: <span className="font-mono">{baseline.random.toFixed(5)}</span></span>
          </div>
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2">Text</th>
                <th className="text-left p-2">IC</th>
                <th className="text-left p-2">Total chars</th>
                <th className="text-left p-2">Unique chars</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td className="p-2" style={{ color: r.color }}>
                    {r.text.slice(0, 20)}{r.text.length > 20 ? '...' : ''}
                  </td>
                  <td className="p-2 font-bold text-2xl" style={{ color: r.color }}>{r.ic.toFixed(5)}</td>
                  <td className="p-2 text-gray-400">{r.total}</td>
                  <td className="p-2 text-gray-400">{r.unique}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex-1 w-full h-full relative">
          {periodLineData ? (
            <Line data={periodLineData} options={lineOptions} className="absolute inset-0 w-full h-full" />
          ) : (
            <p>No data to display.</p>
          )}
        </div>
      )}
    </div>
  );
}
