import { ChartData, ChartOptions } from 'chart.js';

export function useAsciiDistributionChart(byteCounts: number[], gridW?: number) {
  const data: ChartData<'bar'> = {
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

  const options: ChartOptions<'bar'> = {
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (context: any) => `Count: ${context.raw}` },
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
        display: () => {
          const w = gridW || 1;
          const density = data.labels ? data.labels.length / (8 * w) : 0;
          return density < 1;
        },
        formatter: (value: number) => (value > 0 ? value : ''),
        font: { weight: 'bold' },
        color: '#999',
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800, easing: 'easeOutQuart' },
    scales: {
      x: {
        ticks: { precision: 0, maxRotation: 90, minRotation: 90 },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        max: Math.max(...byteCounts) * 1.1,
      },
    },
    elements: { bar: { borderRadius: 3 } },
  };

  return { data, options };
}