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
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { BaseType } from '../../../app/page';
import { useAsciiDistributionChart } from './useAsciiDistributionChart';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

export function AsciiDistributionWidget({
  text,
  base,
  width,
  height,
  gridW,
  asciiRange,
  setAsciiRange,
}: {
  text: string;
  base: BaseType;
  width?: number;
  height?: number;
  gridW?: number;
  asciiRange: 'extended' | 'ascii' | 'input';
  setAsciiRange: (v: 'extended' | 'ascii' | 'input') => void;
}) {
  const [error, setError] = useState<string | null>(null);

  const byteCounts = useMemo(() => {
    const counts = new Array(256).fill(0);
    setError(null);

    try {
      if (base === 'ascii') {
        for (const char of text) {
          const code = char.charCodeAt(0);
          if (code >= 0 && code <= 255) {
            counts[code]++;
          }
        }
      } else if (base === 'hex') {
        const hexPairs = text.match(/([0-9a-fA-F]{2})/g);
        if (!hexPairs) throw new Error('No valid hex pairs found.');
        for (const pair of hexPairs) {
          const num = parseInt(pair, 16);
          if (isNaN(num) || num < 0 || num > 255) continue;
          counts[num]++;
        }
      } else if (base === 'decimal') {
        const decValues = text.match(/\d+/g);
        if (!decValues) throw new Error('No valid decimal numbers found.');
        for (const val of decValues) {
          const num = parseInt(val, 10);
          if (isNaN(num) || num < 0 || num > 255) continue;
          counts[num]++;
        }
      } else if (base === 'octal') {
        const octalValues = text.match(/[0-7]{1,3}/g);
        if (!octalValues) throw new Error('No valid octal numbers found.');
        for (const val of octalValues) {
          const num = parseInt(val, 8);
          if (isNaN(num) || num < 0 || num > 255) continue;
          counts[num]++;
        }
      } else if (base === 'base64') {
        const binaryString = atob(text);
        for (let i = 0; i < binaryString.length; i++) {
          const byte = binaryString.charCodeAt(i);
          if (byte >= 0 && byte <= 255) {
            counts[byte]++;
          }
        }
      }
    } catch (e: any) {
      console.error('Error parsing input:', e);
      setError(e.message || 'Failed to parse input.');
    }

    return counts;
  }, [text, base]);

  const { filteredCounts, labels, minIdx, maxIdx } = useMemo(() => {
    let start = 0, end = 255;
    let minIdx, maxIdx;
    if (asciiRange === 'ascii') {
      end = 127;
    } else if (asciiRange === 'input') {
      minIdx = byteCounts.findIndex((c) => c > 0);
      maxIdx = byteCounts.length - 1 - [...byteCounts].reverse().findIndex((c) => c > 0);
      if (minIdx === -1 || maxIdx === -1) {
        start = 0; end = 0;
      } else {
        start = minIdx; end = maxIdx;
      }
    }
    const filteredCounts = byteCounts.slice(start, end + 1);
    const labels = Array.from({ length: end - start + 1 }, (_, i) => (start + i).toString());
    return { filteredCounts, labels, minIdx: start, maxIdx: end };
  }, [byteCounts, asciiRange]);

  const { data, options } = useAsciiDistributionChart(filteredCounts, gridW, labels);

  return (
    <>
      <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center">
        <h3 className="text-lg font-semibold mx-2">ASCII Distribution</h3>
        <select
          className="p-1 border rounded text-xs max-w-full"
          value={asciiRange}
          onChange={e => setAsciiRange(e.target.value as 'extended' | 'ascii' | 'input')}
        >
          <option value="extended">Extended ASCII (0-255)</option>
          <option value="ascii">ASCII (0-127)</option>
          <option value="input">Input Range only</option>
        </select>
      </div>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : text ? (
        <div className="w-full h-full" style={{ height: height ?? '100%', width: width ?? '100%' }}>
          <Bar data={data} options={options} />
        </div>
      ) : (
        <p>No data to display.</p>
      )}
    </>
  );
}

export const defaultGridSize = { w: 2, h: 2 };
