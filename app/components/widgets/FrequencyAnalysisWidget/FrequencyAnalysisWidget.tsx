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
  Title,
} from 'chart.js';
import { Ciphertext } from '@/types/ciphertext';
import { useFrequencyAnalysis, defaultGridSize } from './useFrequencyAnalysis';
import { useFrequencyAnalysisChart } from './useFrequencyAnalysisChart';

interface FrequencyAnalysisWidgetProps {
  inputs: Ciphertext[];
  width?: number;
  height?: number;
  gridH?: number;
}

export default function FrequencyAnalysisWidget({ inputs, width, height, gridH }: FrequencyAnalysisWidgetProps) {
  const analysis = useFrequencyAnalysis(inputs);
  const { data, options } = useFrequencyAnalysisChart(analysis);

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-2">Frequency Analysis</h3>
      <div className="flex-1 w-full h-full relative">
        {data && data.labels.length > 0 ? (
          <Bar data={data} options={options} className="absolute inset-0 w-full h-full" />
        ) : (
          <p>No data to display.</p>
        )}
      </div>
    </div>
  );
}

