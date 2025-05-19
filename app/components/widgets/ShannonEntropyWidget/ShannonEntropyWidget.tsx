import { useMemo, useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useShannonEntropyChart } from './useShannonEntropyChart';

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartDataLabels
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

export function ShannonEntropyWidget({
  text,
  base,
  mode,
  windowSize,
  onModeChange,
  onWindowSizeChange,
  width,
  height,
}: {
  text: string;
  base: BaseType;
  mode: 'raw' | 'sliding';
  windowSize: number;
  onModeChange: (mode: 'raw' | 'sliding') => void;
  onWindowSizeChange: (size: number) => void;
  width?: number;
  height?: number;
}) {
  const baseline = ENTROPY_BASELINES[base];

  const { entropy, total, unique, slidingSeries } = useMemo(() => {
    if (!text || text.length < 2) return { entropy: 0, total: 0, unique: 0, slidingSeries: [] };

    if (mode === 'sliding') {
      const entropies: number[] = [];
      for (let i = 0; i <= text.length - windowSize; i++) {
        const window = text.slice(i, i + windowSize);
        entropies.push(computeEntropy(window));
      }
      return {
        entropy: 0,
        total: text.length,
        unique: new Set(text).size,
        slidingSeries: entropies,
      };
    } else {
      const freq: Record<string, number> = {};
      for (const char of text) {
        freq[char] = (freq[char] || 0) + 1;
      }
      const total = text.length;
      const unique = Object.keys(freq).length;
      let entropy = 0;
      for (const count of Object.values(freq)) {
        const p = count / total;
        entropy -= p * Math.log2(p);
      }
      return { entropy, total, unique, slidingSeries: [] };
    }
  }, [text, base, mode, windowSize]);

  const { data, options } = useShannonEntropyChart(slidingSeries);

  return (
    <>
      <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h3 className="text-lg font-semibold">Shannon Entropy</h3>
        <div className="flex flex-wrap items-center gap-2 gap-y-1 justify-end">
          <label className="font-medium">Mode:</label>
          <select
            value={mode}
            onChange={(e) => onModeChange(e.target.value as 'raw' | 'sliding')}
            className="p-1 border rounded"
          >
            <option value="raw">Full Input</option>
            <option value="sliding">Sliding Window</option>
          </select>
          {mode === 'sliding' && (
            <>
              <label className="ml-4 font-medium">Window Size:</label>
              <select
                value={windowSize}
                onChange={(e) => onWindowSizeChange(parseInt(e.target.value))}
                className="p-1 border rounded"
              >
                {[16, 32, 64, 128, 256].map((sz) => (
                  <option key={sz} value={sz}>{sz}</option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>
      {text ? (
        mode === 'sliding' ? (
          <div className="w-full h-full min-h-0" style={{ height: height ?? '100%', width: width ?? '100%' }}>
            <Line
              data={data}
              options={options}
            />
          </div>
        ) : (
          <div className="flex-1 h-full w-full flex flex-col justify-center items-center space-y-2 min-h-0">
            <div className="text-4xl font-bold">
              {entropy.toFixed(5)} bits/symbol
            </div>
            <div className="text-sm text-gray-600 w-fit">
              <div className="flex justify-between gap-12">
                <div>
                  <strong>English avg:</strong> {baseline.english.toFixed(5)}
                </div>
                <div>
                  <strong>Random avg:</strong> {baseline.random.toFixed(5)}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600 text-center">
              ({total} characters, {unique} unique)
            </div>
          </div>
        )
      ) : (
        <p>No input provided.</p>
      )}
    </>
  );
}

export const defaultGridSize = { w: 1, h: 1 };
