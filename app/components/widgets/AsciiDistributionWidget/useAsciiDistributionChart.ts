import { useMemo } from 'react';
import { BaseType } from '@/types/bases';
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

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels, Title);

export const defaultGridSize = { w: 2, h: 2 };

export function useAsciiDistributionChart({ distributions, start, end, encoding }) {
  const data = useMemo(() => {
    const datasets = distributions.map(dist => ({
      label: `Text ${dist.text.slice(0, 7)}${dist.text.length > 7 ? '...' : ''}`,
      data: dist.counts.slice(start, end),
      backgroundColor: dist.color,
      borderColor: dist.color,
      borderWidth: 1,
    }));
    const labels = Array.from({ length: end - start }, (_, i) => {
      const code = start + i;
      return code;
    });
    return {
      labels,
      datasets,
    };
  }, [distributions, start, end]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
        text: '',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value}`;
          }
        }
      },
      datalabels: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Count'
        }
      },
      x: {
        title: {
          display: true,
          text: 'ASCII Code'
        }
      }
    }
  }), [distributions, start, end]);

  return { data, options };
}