import { ChartData, ChartOptions } from 'chart.js';

export function useIndexOfCoincidenceChart(periodAnalysis: { period: number; averageIC: number }[], maxEntry: { period: number; averageIC: number }) {
  const data: ChartData<'line'> = {
    labels: periodAnalysis.map((r) => r.period.toString()),
    datasets: [
      {
        label: 'Avg IC',
        data: periodAnalysis.map((r) => r.averageIC),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        datalabels: { color: '#999' },
        tension: 0.3,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    plugins: {
      legend: { display: true },
      datalabels: { display: false },
      tooltip: {
        callbacks: {
          afterBody: (ctx: any) => {
            const period = parseInt(ctx[0].label);
            return period === maxEntry.period ? '⬆ Likely period' : '';
          },
        },
      },
      annotation: {
        annotations: {
          verticalLine: {
            type: 'line',
            scaleID: 'x',
            value: maxEntry.period.toString(),
            borderColor: 'red',
            borderWidth: 2,
            label: {
              display: true,
              content: 'Likely Period',
              position: 'end',
              color: '#999',
            },
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        max: Math.max(...periodAnalysis.map(r => r.averageIC)) * 1.1,
      },
      x: {
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return { data, options };
}