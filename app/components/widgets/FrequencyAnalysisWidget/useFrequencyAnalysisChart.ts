import { ChartData, ChartOptions } from 'chart.js';

export function useFrequencyAnalysisChart(labels: string[], counts: number[]) {
  const data: ChartData<'bar'> = {
    labels,
    datasets: [
      {
        label: 'Frequency',
        data: counts,
        borderWidth: 1,
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        hoverBackgroundColor: 'rgba(37, 99, 235, 0.8)',
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (context: any) => `Count: ${context.raw}` },
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
        formatter: (value: number) => value,
        font: { weight: 'bold' },
        color: '#999',
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800, easing: 'easeOutQuart' },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { precision: 0 },
        grid: { color: 'rgba(0,0,0,0.05)' },
        max: Math.max(...counts) * 1.1,
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { autoSkip: false },
      },
    },
    elements: { bar: { borderRadius: 8 } },
  };

  return { data, options };
}