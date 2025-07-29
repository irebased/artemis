import React, { forwardRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { BinOccupancyResult } from './useExpectedBinOccupancy';
import { ExpectedBinOccupancySettings } from '@/types/dashboard/dashboardTypes';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ExpectedBinOccupancyChartProps {
  results: BinOccupancyResult[];
  expected: number[];
  lower: number[];
  upper: number[];
  nBins: number;
  nBalls: number;
  settings: ExpectedBinOccupancySettings;
}

export const ExpectedBinOccupancyChart = forwardRef<
  any,
  ExpectedBinOccupancyChartProps
>(({ results, expected, lower, upper, nBins, nBalls, settings }, ref) => {
  if (!results.length) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No data to display
      </div>
    );
  }

  // X-axis: Bin ranks (1, 2, 3, ...)
  const labels = Array.from({ length: nBins }, (_, i) => (i + 1).toString());

  const datasets: any[] = [];

  // Add confidence interval band (if enabled)
  if (settings.showConfidenceBands) {
    datasets.push({
      label: `${Math.round(settings.confidenceLevel * 100)}% confidence band`,
      data: upper,
      borderColor: 'rgba(255, 0, 195, 0.3)',
      backgroundColor: 'rgba(255, 0, 195, 0.05)',
      borderWidth: 1,
      fill: '+1',
      tension: 0,
      pointRadius: 0,
    });

    datasets.push({
      label: `${Math.round(settings.confidenceLevel * 100)}% confidence band`,
      data: lower,
      borderColor: 'rgba(255, 0, 195, 0.3)',
      backgroundColor: 'rgba(255, 0, 195, 0.05)',
      borderWidth: 1,
      fill: false,
      tension: 0,
      pointRadius: 0,
    });
  }

  // Add expected curve (if enabled)
  if (settings.showExpectedCurve) {
    datasets.push({
      label: 'Expected (Random)',
      data: expected,
      borderColor: 'rgba(255, 0, 195, 0.5)',
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderDash: [5, 5],
      fill: false,
      tension: 0,
      pointRadius: 0,
    });
  }

  // Add observed curves for each input
  results.forEach((result, index) => {
    const color = result.input.color;

    datasets.push({
      label: `${result.input.text.substring(0, 20)}${result.input.text.length > 20 ? '...' : ''}`,
      data: result.sortedFrequencies,
      borderColor: color,
      backgroundColor: color + '80',
      borderWidth: 2,
      fill: false,
      tension: 0,
      pointRadius: 0, // Hide points by default
      pointHoverRadius: 6, // Show points on hover
    });
  });

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: `Expected vs Observed Bin Occupancy\n(${nBalls} Characters, ${nBins} Bins)`,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${Math.round(value)} characters`;
          },
        },
      },
      datalabels: {
        display: false, // Completely disable data labels
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Bin Rank (Sorted by Occupancy)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Characters in Bin',
        },
        ticks: {
          callback: function(value: any) {
            return Math.round(value);
          },
        },
      },
    },
  };

  return (
    <Line
      data={{ labels, datasets }}
      options={options}
      ref={ref}
      className="absolute inset-0 w-full h-full"
    />
  );
});

ExpectedBinOccupancyChart.displayName = 'ExpectedBinOccupancyChart';