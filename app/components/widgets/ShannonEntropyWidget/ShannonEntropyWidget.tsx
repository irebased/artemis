import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { InputData } from '@/app/useDashboardParams';
import BaseType from '@/app/page';
import { useShannonEntropyChart } from './useShannonEntropyChart';

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
);

const ENTROPY_BASELINES = {
  ascii: { english: 4.321011139059028, random: 5.696167170226023 },
  base64: { english: 5.397278374532011, random: 6.0 },
  hex: { english: 3.1145264801712846, random: 4.0 },
  decimal: { english: 2.729561401738525, random: 3.3005590923909547 },
  octal: { english: 2.723477924808014, random: 3.0 },
} as const;

type BaseType = keyof typeof ENTROPY_BASELINES;

function computeEntropy(text: string): number {
  const freq: Record<string, number> = {};
  for (const char of text) {
    freq[char] = (freq[char] || 0) + 1;
  }

  const total = text.length;
  let entropy = 0;
  for (const count of Object.values(freq)) {
    const p = count / total;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

interface ShannonEntropyWidgetProps {
  texts: InputData[];
  base: BaseType;
  width?: number;
  height?: number;
  mode: 'raw' | 'sliding';
  windowSize: number;
  onModeChange: (mode: 'raw' | 'sliding') => void;
  onWindowSizeChange: (size: number) => void;
}

export const defaultGridSize = { w: 2, h: 2 };

export default function ShannonEntropyWidget({
  texts,
  base,
  width,
  height,
  mode,
  windowSize,
  onModeChange,
  onWindowSizeChange,
}: ShannonEntropyWidgetProps) {

  const results = useMemo(() => {
    return texts.map(input => {
      const text = input.text;
      if (text.length === 0) return { text, color: input.color, entropy: 0, sliding: [], total: 0, unique: 0 };
      const freq: Record<string, number> = {};
      for (const char of text) {
        freq[char] = (freq[char] || 0) + 1;
      }
      const total = text.length;
      const unique = Object.keys(freq).length;
      const entropy = -Object.values(freq).reduce((sum, count) => {
        const p = count / total;
        return sum + p * Math.log2(p);
      }, 0);

      const sliding: number[] = [];
      for (let i = 0; i <= text.length - windowSize; i++) {
        const window = text.slice(i, i + windowSize);
        const freq: Record<string, number> = {};
        for (const char of window) {
          freq[char] = (freq[char] || 0) + 1;
        }
        const entropy = -Object.values(freq).reduce((sum, count) => {
          const p = count / windowSize;
          return sum + p * Math.log2(p);
        }, 0);
        sliding.push(entropy);
      }
      return {
        text,
        color: input.color,
        entropy,
        sliding,
        total,
        unique,
      };
    });
  }, [texts, windowSize]);

  const { data: slidingLineData, options: slidingLineOptions } = useShannonEntropyChart(results, windowSize);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4 flex flex-row items-center justify-between gap-2">
        <h3 className="text-lg font-semibold mb-0">Shannon Entropy</h3>
        {mode === 'sliding' && (
          <div className="flex items-center gap-2">
            <label className="mr-2">Window Size:</label>
            <select
              value={windowSize}
              onChange={e => onWindowSizeChange(Number(e.target.value))}
              className="p-2 border rounded"
            >
              {[16, 32, 64, 128, 256].map(sz => (
                <option key={sz} value={sz}>{sz}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <select
            value={mode}
            onChange={(e) => onModeChange(e.target.value as 'raw' | 'sliding')}
            className="p-2 border rounded"
          >
            <option value="raw">Raw Entropy</option>
            <option value="sliding">Sliding Window</option>
          </select>
        </div>
      </div>
      {mode === 'raw' ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2">Text</th>
                <th className="text-left p-2">Entropy</th>
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
                  <td className="p-2 font-bold text-2xl" style={{ color: r.color }}>{r.entropy.toFixed(5)}</td>
                  <td className="p-2 text-gray-400">{r.total}</td>
                  <td className="p-2 text-gray-400">{r.unique}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex-1 w-full h-full relative">
          {slidingLineData ? (
            <Line data={slidingLineData} options={slidingLineOptions} className="absolute inset-0 w-full h-full" />
          ) : (
            <p>No data to display.</p>
          )}
        </div>
      )}
    </div>
  );
}
