// @ts-nocheck
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
import { useFrequencyAnalysisChart } from './useFrequencyAnalysisChart';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

export default function FrequencyAnalysisWidget({ text, width, height, gridH }: {
  text: string,
  width?: number,
  height?: number,
  gridH?: number
}) {
  const { labels, counts, percentages } = useMemo(() => {
    const freq: Record<string, number> = {};
    for (const char of text) {
      freq[char] = (freq[char] || 0) + 1;
    }
    const total = text.length || 1;
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    return {
      labels: sorted.map(([char]) => (char === ' ' ? '[space]' : char)),
      counts: sorted.map(([, count]) => count),
      percentages: sorted.map(([, count]) => (count / total) * 100),
    };
  }, [text]);

  const { data, options } = useFrequencyAnalysisChart(labels, counts, percentages, gridH);

  return (
    <>
      <div className="mb-2">
        <h3 className="text-lg font-semibold">Frequency Analysis</h3>
      </div>
      {labels.length > 0 ? (
        <div className="w-full h-full" style={{ height: height ?? '100%', width: width ?? '100%' }}>
          <Bar data={data} options={options} />
        </div>
      ) : (
        <p>No data to display.</p>
      )}
    </>
  );
}

export const defaultGridSize = { w: 1, h: 1 };

