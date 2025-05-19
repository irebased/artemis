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
import { InputData } from '@/app/useDashboardParams';
import { useFrequencyAnalysisChart } from './useFrequencyAnalysisChart';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

interface FrequencyAnalysisWidgetProps {
  texts: InputData[];
  width?: number;
  height?: number;
  gridH?: number;
}

export const defaultGridSize = { w: 2, h: 2 };

export default function FrequencyAnalysisWidget({ texts, width, height, gridH }: FrequencyAnalysisWidgetProps) {
  const { data, options } = useFrequencyAnalysisChart(texts);

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-2">Frequency Analysis</h3>
      <div className="flex-1 w-full h-full relative">
        <Bar data={data} options={options} className="absolute inset-0 w-full h-full" />
      </div>
    </div>
  );
}

