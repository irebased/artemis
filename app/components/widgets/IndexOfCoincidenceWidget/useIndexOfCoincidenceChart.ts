import { useMemo } from 'react';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  BarElement,
  Title,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import annotationPlugin from 'chartjs-plugin-annotation';
import type { ChartOptions } from 'chart.js';

// Register ChartJS components
ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartDataLabels,
  annotationPlugin,
  BarElement,
  Title
);

export const defaultGridSize = { w: 2, h: 2 };

export function useIndexOfCoincidenceChart(results, view, baseline) {
  const data = useMemo(() => {
    if (!results.length) return null;

    if (view === 'summary') {
      return {
        labels: results.map(r => r.text.slice(0, 20) + (r.text.length > 20 ? '...' : '')),
        datasets: [{
          label: 'IC',
          data: results.map(r => r.ic),
          backgroundColor: results.map(r => r.color),
          borderColor: results.map(r => r.color),
          borderWidth: 1,
        }]
      };
    } else {
      const maxPeriod = Math.max(...results.map(r => r.periodicity.length));
      const labels = Array.from({ length: maxPeriod }, (_, i) => (i + 2).toString());
      const datasets = results.map(r => ({
        label: r.text.slice(0, 20) + (r.text.length > 20 ? '...' : ''),
        data: r.periodicity.map(p => p.ic),
        borderColor: r.color,
        backgroundColor: r.color,
        fill: false,
        tension: 0.2,
      }));
      return { labels, datasets };
    }
  }, [results, view]);

  const options: ChartOptions<'line'> = useMemo(() => ({
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
            const value = context.parsed.y.toFixed(5);
            return `${context.dataset.label}: ${value}`;
          }
        }
      },
      datalabels: {
        display: false,
      },
      annotation: view === 'period' ? {
        annotations: {
          englishLine: {
            type: 'line' as const,
            yMin: baseline.english,
            yMax: baseline.english,
            borderColor: 'rgba(255, 99, 132, 0.5)',
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              content: 'English',
              enabled: true,
              position: 'start'
            }
          },
          randomLine: {
            type: 'line' as const,
            yMin: baseline.random,
            yMax: baseline.random,
            borderColor: 'rgba(54, 162, 235, 0.5)',
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              content: 'Random',
              enabled: true,
              position: 'start'
            }
          }
        }
      } : undefined
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Index of Coincidence'
        }
      },
      x: {
        title: {
          display: true,
          text: view === 'period' ? 'Period' : 'Text'
        }
      }
    }
  }), [results, view, baseline]);

  return { data, options };
}