import { ChartData, ChartOptions } from 'chart.js';

export function useShannonEntropyChart(slidingSeries: number[]) {
  const data: ChartData<'line'> = {
    labels: slidingSeries.map((_, i) => i.toString()),
    datasets: [
      {
        label: 'Entropy',
        data: slidingSeries,
        borderColor: 'rgba(59,130,246,1)',
        backgroundColor: 'rgba(59,130,246,0.3)',
        tension: 0.2,
        datalabels: { color: '#999' },
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    plugins: {
      legend: { display: false },
      datalabels: { display: false },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        max: Math.max(...slidingSeries) * 1.1,
      },
      x: {
        display: false,
        grid: { display: false },
      },
    },
  };

  return { data, options };
}