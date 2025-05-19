import { useMemo } from 'react';
import { ChartOptions, ChartData } from 'chart.js';

export function useIndexOfCoincidenceChart(results, view, baseline) {
  const data = useMemo(() => {
    if (view === 'summary' || !results.length || !results[0].periodics.length) return null;
    const labels = results[0].periodics.map(p => `${p.period}`);
    const datasets = results.map(r => ({
      label: `Text ${r.text.slice(0, 20)}${r.text.length > 20 ? '...' : ''}`,
      data: r.periodics.map(p => p.ic),
      borderColor: r.color,
      backgroundColor: r.color,
      fill: false,
      tension: 0.2,
    }));
    return { labels, datasets };
  }, [results, view]);

  const options = useMemo(() => {
    if (view === 'summary' || !data) return null;
    let annotations = {};
    if (data && data.datasets) {
      data.datasets.forEach((ds, idx) => {
        const maxIdx = ds.data.reduce((maxI, val, i, arr) => val > arr[maxI] ? i : maxI, 0);
        const color = ds.borderColor || ds.backgroundColor || '#888';
        annotations[`likelyPeriod${idx}`] = {
          type: 'line',
          scaleID: 'x',
          value: data.labels[maxIdx],
          borderColor: color,
          borderWidth: 2,
          label: {
            display: true,
            content: 'Likely period',
            color: color,
            position: 'end',
            backgroundColor: 'rgba(0,0,0,0.7)',
            font: { weight: 'bold' },
          },
        };
      });
    }
    return {
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
        annotation: {
          annotations,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Index of Coincidence'
          }
        }
      }
    };
  }, [data, view]);

  return { data, options };
}