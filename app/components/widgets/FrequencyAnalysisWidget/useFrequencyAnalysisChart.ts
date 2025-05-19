import { ChartData, ChartOptions } from 'chart.js';

export function useFrequencyAnalysisChart(labels: string[], counts: number[], percentages: number[], gridH?: number) {
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
        callbacks: {
          label: (context: any) => {
            const count = context.raw;
            const percent = percentages[context.dataIndex];
            return `Count: ${count} (${percent.toFixed(1)}%)`;
          },
        },
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
        display: () => {
          const h = gridH || 1;
          const density = labels.length / (10 * h);
          return density < 1;
        },
        formatter: (value: number, context: any) => {
          const percent = percentages[context.dataIndex];
          return `${value} (${percent.toFixed(1)}%)`;
        },
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
        max: Math.max(...counts) * 1.35,
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