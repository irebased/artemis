'use client';

import { useEffect, useMemo, useState } from 'react';
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

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

export const BASE_OPTIONS = ['ascii', 'hex', 'decimal', 'base64', 'octal'] as const;
type BaseType = (typeof BASE_OPTIONS)[number];

export function AsciiDistributionWidget({
  text,
  initialBase,
  onBaseChange,
}: {
  text: string;
  initialBase: BaseType;
  onBaseChange: (newBase: BaseType) => void;
}) {
  const [base, setBase] = useState<BaseType>(initialBase);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onBaseChange(base);
  }, [base, onBaseChange]);

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

  const data = {
    labels: Array.from({ length: 256 }, (_, i) => i.toString()),
    datasets: [
      {
        label: 'Count',
        data: byteCounts,
        borderWidth: 1,
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        hoverBackgroundColor: 'rgba(37, 99, 235, 0.8)',
        borderColor: 'rgba(59, 130, 246, 0.7)',
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Count: ${context.raw}`,
        },
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
        formatter: (value: number) => (value > 0 ? value : ''),
        font: {
          weight: 'bold',
        },
        color: '#1e3a8a',
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    borderSkipped: false,
    animation: {
      duration: 800,
      easing: 'easeOutQuart',
    },
    scales: {
      x: {
        ticks: {
          precision: 0,
          maxRotation: 90,
          minRotation: 90,
        },
        grid: {
          drawBorder: false,
          color: 'rgba(0,0,0,0.05)',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
          color: 'rgba(0,0,0,0.05)',
        },
      },
    },
    elements: {
      bar: {
        borderRadius: 3,
      },
    },
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">ASCII Distribution</h3>
          <select
            value={base}
            onChange={(e) => setBase(e.target.value as BaseType)}
            className="p-2 border rounded"
          >
            {BASE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardBody>
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : text ? (
          <div className="w-full" style={{ height: 400 }}>
            <Bar data={data} options={options} />
          </div>
        ) : (
          <p>No data to display.</p>
        )}
      </CardBody>
    </Card>
  );
}
