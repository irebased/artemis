// @ts-nocheck
'use client';

import { useEffect, useMemo, useState } from 'react';
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
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { BaseType } from '../../../app/page';
import { useAsciiDistributionChart } from './useAsciiDistributionChart';
import { InputData } from '@/app/useDashboardParams';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels, Title);

interface AsciiDistributionWidgetProps {
  texts: InputData[];
  base: BaseType;
  width?: number;
  height?: number;
  gridW?: number;
  asciiRange: 'extended' | 'ascii' | 'input';
  setAsciiRange: (range: 'extended' | 'ascii' | 'input') => void;
}

export const defaultGridSize = { w: 2, h: 2 };

export default function AsciiDistributionWidget({
  texts,
  base,
  width,
  height,
  gridW,
  asciiRange,
  setAsciiRange,
}: AsciiDistributionWidgetProps) {
  const [error, setError] = useState<string | null>(null);

  const { data, options } = useAsciiDistributionChart(texts, base, asciiRange);

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-2">ASCII Distribution</h3>
      <div className="mb-4">
        <label className="mr-2">ASCII Range:</label>
        <select
          value={asciiRange}
          onChange={(e) => setAsciiRange(e.target.value as 'extended' | 'ascii' | 'input')}
          className="p-2 border rounded"
        >
          <option value="extended">Extended ASCII (0-255)</option>
          <option value="ascii">ASCII (0-127)</option>
          <option value="input">Input Range Only</option>
        </select>
      </div>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : texts.length > 0 ? (
        <div className="flex-1 w-full h-full relative">
          <Bar data={data} options={options} className="absolute inset-0 w-full h-full" />
        </div>
      ) : (
        <p>No data to display.</p>
      )}
    </div>
  );
}
