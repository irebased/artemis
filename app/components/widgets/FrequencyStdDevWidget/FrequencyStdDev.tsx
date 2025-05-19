// @ts-nocheck
'use client';

import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useFrequencyStdDevChart } from './useFrequencyStdDevChart';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

export default function FrequencyStdDevWidget({ text, width, height }: { text: string, width?: number, height?: number }) {
  const { labels, mean, stdDev, deviations } = useMemo(() => {
    const freq: Record<string, number> = {};
    for (const char of text) {
      freq[char] = (freq[char] || 0) + 1;
    }

    const values = Object.values(freq);
    const n = values.length;
    const mean = n > 0 ? values.reduce((sum, val) => sum + val, 0) / n : 0;
    const variance =
      n > 0
        ? values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n
        : 0;
    const stdDev = Math.sqrt(variance);

    const deviations = Object.entries(freq).map(([char, count]) => ({
      char: char === ' ' ? '[space]' : char,
      deviation: count - mean,
    }));

    return {
      labels: deviations.map((d) => d.char),
      mean,
      stdDev,
      deviations: deviations.map((d) => d.deviation),
    };
  }, [text]);

  const { data, options } = useFrequencyStdDevChart(labels, deviations);

  return (
    <>
      <div className="mb-2">
        <h3 className="text-lg font-semibold">Frequency Standard Deviation</h3>
      </div>
      {text ? (
        <>
          <div className="mb-4">
            <p>
              <strong>Mean Frequency:</strong> {mean.toFixed(2)}
            </p>
            <p>
              <strong>Standard Deviation:</strong> {stdDev.toFixed(2)}
            </p>
          </div>
          <div className="w-full h-full" style={{ height: height ?? '100%', width: width ?? '100%' }}>
            <Bar data={data} options={options} />
          </div>
        </>
      ) : (
        <p>No data to display.</p>
      )}
    </>
  );
}

export const defaultGridSize = { w: 2, h: 2 };
