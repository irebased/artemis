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
import { BaseType } from '@/types/bases';
import { InputData } from '@/app/useDashboardParams';
import { useAsciiDistribution, defaultGridSize } from './useAsciiDistribution';
import { useAsciiDistributionChart } from './useAsciiDistributionChart';

interface AsciiDistributionWidgetProps {
  texts: InputData[];
  base: BaseType;
  gridW?: number;
  asciiRange: string;
  setAsciiRange: (range: string) => void;
}

export default function AsciiDistributionWidget({ texts, base, gridW, asciiRange, setAsciiRange }: AsciiDistributionWidgetProps) {
  const analysis = useAsciiDistribution(texts, base, asciiRange);
  const { data, options } = useAsciiDistributionChart(analysis, base);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4 flex flex-row items-center justify-between gap-2">
        <h3 className="text-lg font-semibold mb-0">ASCII Distribution</h3>
        <div>
          <label className="mr-2">Range:</label>
          <select
            value={asciiRange}
            onChange={e => setAsciiRange(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="full">Full (0-255)</option>
            <option value="ascii">ASCII (0-127)</option>
            <option value="input">Input Range</option>
          </select>
        </div>
      </div>
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
