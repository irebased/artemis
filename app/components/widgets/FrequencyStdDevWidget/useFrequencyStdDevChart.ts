import { ChartData, ChartOptions } from 'chart.js';

export function useFrequencyStdDevChart(labels: string[], deviations: number[]) {
  const data: ChartData<'bar'> = {
    labels,
    datasets: [
      {
        label: 'Deviation from Mean',
        data: deviations,
        borderWidth: 1,
        borderSkipped: false,
        categoryPercentage: 1.0,
        barPercentage: 1.0,
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        hoverBackgroundColor: 'rgba(59, 130, 246, 0.7)',
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (context: any) => `Deviation: ${context.raw.toFixed(2)}` },
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
        formatter: (value: number) => (value !== 0 ? value.toFixed(2) : ''),
        font: { weight: 'bold' },
        color: '#999',
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800, easing: 'easeOutQuart' },
    scales: {
      x: {
        ticks: { precision: 0 },
        grid: { color: 'rgba(0,0,0,0.05)' },
        max: Math.max(...deviations) * 1.1,
      },
      y: {
        beginAtZero: false,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { autoSkip: true, maxTicksLimit: 10 },
      },
    },
    elements: { bar: { borderRadius: 3 } },
  };

  return { data, options };
}