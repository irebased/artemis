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
    if (!results.length || !results[0].windowEntropy.length) return null;
    const labels = results[0].windowEntropy.map(e => e.position.toString());
    const datasets = results.map(r => ({
      label: `Text ${r.text.slice(0, 7)}${r.text.length > 7 ? '...' : ''}`,
      data: r.windowEntropy.map(e => e.entropy),
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