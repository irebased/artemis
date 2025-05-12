'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardBody } from '@heroui/react';
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
import { BaseType } from '@/types/bases';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

const IC_BASELINES = {
  ascii: { english: 0.065, random: 0.01805 },
  base64: { english: 0.02811, random: 0.01387 },
  hex: { english: 0.13985, random: 0.05714 },
  decimal: { english: 0.25448, random: 0.09769 },
  octal: { english: 0.20402, random: 0.12121 },
} as const;

export function IndexOfCoincidenceWidget({
  text,
  base,
}: {
  text: string;
  base: BaseType;
}) {
  const { ic, total, error } = useMemo(() => {
    const symbols = text.split('');

    if (symbols.length < 2) return { ic: 0, total: 0, error: null };

    const freq: Record<string, number> = {};
    for (const char of symbols) {
      freq[char] = (freq[char] || 0) + 1;
    }

    const total = symbols.length;
    const numerator = Object.values(freq).reduce((acc, f) => acc + f * (f - 1), 0);
    const denominator = total * (total - 1);
    const ic = denominator > 0 ? numerator / denominator : 0;

    return { ic, total, error: null };
  }, [text]);

  const baseline = IC_BASELINES[base];

  const data = {
    labels: ['Calculated', 'English Avg', 'Random Text'],
    datasets: [
      {
        label: 'Index of Coincidence',
        data: [ic, baseline.english, baseline.random],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(239, 68, 68, 0.7)',
        ],
        borderRadius: 5,
        datalabels: {
          anchor: 'end',
          align: 'end',
          formatter: (val: number) => val.toFixed(5),
        },
      },
    ],
  };

  const options = {
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `IC: ${ctx.raw.toFixed(5)}`,
        },
      },
      datalabels: {
        font: { weight: 'bold' },
        color: '#1e3a8a',
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: Math.max(ic, baseline.english, baseline.random) * 1.2,
        ticks: { stepSize: 0.01 },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <h3 className="text-lg font-semibold">Index of Coincidence</h3>
      </CardHeader>
      <CardBody>
        {error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : text ? (
          <>
            <p className="mb-2">
              <strong>Symbols analyzed:</strong> {total}
            </p>
            <p className="mb-4">
              <strong>Index of Coincidence:</strong> {ic.toFixed(5)}
            </p>
            <div className="w-full" style={{ height: 300 }}>
              {/* @ts-ignore */}
              <Bar data={data} options={options} />
            </div>
          </>
        ) : (
          <p>No input provided.</p>
        )}
      </CardBody>
    </Card>
  );
}
