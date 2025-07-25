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

export const defaultGridSize = { w: 4, h: 4, minW: 3, minH: 3 };

export function useFrequencyAnalysisChart({ frequencies, sortedChars }, sortByInput?: number, sortDirection?: 'asc' | 'desc') {
  const data = useMemo(() => {
    // Apply sorting if specified
    let sortedLabels = [...sortedChars];
    if (sortByInput !== undefined && sortDirection !== undefined) {
      const inputFrequencies = frequencies[sortByInput]?.frequencies || {};

      sortedLabels.sort((a, b) => {
        const aFreq = inputFrequencies[a] || 0;
        const bFreq = inputFrequencies[b] || 0;

        if (sortDirection === 'asc') {
          return aFreq - bFreq;
        } else {
          return bFreq - aFreq;
        }
      });
    }

    const visibleLabels = sortedLabels.map(label => label.replace(/ /g, '\u2027'));
    const datasets = frequencies.map(freq => ({
      label: `${freq.text.slice(0, 7)}${freq.text.length > 7 ? '...' : ''}`,
      data: sortedLabels.map(char => freq.frequencies[char] || 0),
      backgroundColor: freq.color,
      borderColor: freq.color,
      borderWidth: 1,
    }));
    return {
      labels: visibleLabels,
      datasets,
    };
  }, [frequencies, sortedChars, sortByInput, sortDirection]);

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