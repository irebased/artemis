// @ts-nocheck
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

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

export default function FrequencyStdDevWidget({ text }: { text: string }) {
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

  const data = {
    labels,
    datasets: [
      {
        label: 'Deviation from Mean',
        data: deviations,
        borderWidth: 1,
        borderSkipped: false,
        categoryPercentage: 1.0,
        barPercentage: 1.0,
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        hoverBackgroundColor: 'rgba(5, 150, 105, 0.8)',
      },
    ],
  };

  const options = {
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => `Deviation: ${context.raw.toFixed(2)}`,
        },
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
        formatter: (value: number) => (value !== 0 ? value.toFixed(2) : ''),
        font: { weight: 'bold' },
        color: '#064e3b',
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
      easing: 'easeOutQuart',
    },
    scales: {
      x: {
        ticks: { precision: 0 },
        grid: { drawBorder: false, color: 'rgba(0,0,0,0.05)' },
      },
      y: {
        beginAtZero: false,
        grid: { drawBorder: false, color: 'rgba(0,0,0,0.05)' },
      },
    },
    elements: {
      bar: { borderRadius: 3 },
    },
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <h3 className="text-lg font-semibold">Frequency Standard Deviation</h3>
      </CardHeader>
      <CardBody>
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
            <div className="w-full" style={{ height: 400 }}>
              <Bar data={data} options={options} />
            </div>
          </>
        ) : (
          <p>No data to display.</p>
        )}
      </CardBody>
    </Card>
  );
}
