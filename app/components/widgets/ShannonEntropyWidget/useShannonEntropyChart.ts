import { useMemo } from 'react';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
);

export const defaultGridSize = { w: 2, h: 2 };

export function useShannonEntropyChart(results, windowSize) {
  const data = useMemo(() => {
    if (!results.length || !results[0].sliding.length) return null;
    const labels = Array.from({ length: results[0].sliding.length }, (_, i) => i.toString());
    const datasets = results.map(r => ({
      label: `Text ${r.text.slice(0, 20)}${r.text.length > 20 ? '...' : ''}`,
      data: r.sliding,
      borderColor: r.color,
      backgroundColor: r.color,
      fill: false,
      tension: 0.2,
    }));
    return { labels, datasets };
  }, [results, windowSize]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
        text: '',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed.y.toFixed(4);
            return `${context.dataset.label}: ${value}`;
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
          text: 'Entropy (bits)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Position'
        }
      }
    }
  }), [results, windowSize]);

  return { data, options };
}