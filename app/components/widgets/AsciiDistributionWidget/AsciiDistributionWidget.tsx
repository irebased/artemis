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
}: {
  text: string;
  base: BaseType;
  width?: number;
  height?: number;
  gridW?: number;
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

  const { data, options } = useAsciiDistributionChart(byteCounts, gridW);

  return (
    <>
      <div className="mb-2 flex justify-between items-center">
        <h3 className="text-lg font-semibold mx-4">ASCII Distribution</h3>
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
