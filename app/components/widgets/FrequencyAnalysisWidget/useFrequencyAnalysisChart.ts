import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { useMemo } from 'react';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

export const defaultGridSize = { w: 2, h: 2 };

export function useFrequencyAnalysisChart({ frequencies, sortedChars }) {
  const data = useMemo(() => {
    const visibleLabels = sortedChars.map(label => label.replace(/ /g, '\u2027'));
    const datasets = frequencies.map(freq => ({
      label: `${freq.text.slice(0, 7)}${freq.text.length > 7 ? '...' : ''}`,
      data: sortedChars.map(char => freq.frequencies[char] || 0),
      backgroundColor: freq.color,
      borderColor: freq.color,
      borderWidth: 1,
    }));
    return {
      labels: visibleLabels,
      datasets,
    };
  }, [frequencies, sortedChars]);

  const options = useMemo(() => ({
    responsive: true,
    indexAxis: 'y',
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
            const value = context.parsed.x !== undefined ? context.parsed.x : context.parsed.y;
            return `${label}: ${value.toFixed(2)}%`;
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
          text: 'Character'
        },
        ticks: {
          font: {
            family: 'monospace',
            size: 12,
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Frequency (%)'
        }
      }
    }
  }), [frequencies, sortedChars]);

  return { data, options };
}