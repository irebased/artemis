import { useMemo } from 'react';
import { Card, CardHeader, CardBody } from '@heroui/react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

export default function FrequencyAnalysisWidget({ text }: { text: string }) {
  const { labels, counts } = useMemo(() => {
    const freq: Record<string, number> = {};
    for (const char of text) {
      freq[char] = (freq[char] || 0) + 1;
    }

    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);

    return {
      labels: sorted.map(([char]) => (char === ' ' ? '[space]' : char)),
      counts: sorted.map(([, count]) => count),
    };
  }, [text]);

  const data = {
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

  const options = {
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Count: ${context.raw}`,
        },
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
        formatter: (value: number) => value,
        font: {
          weight: 'bold',
        },
        color: '#1e3a8a',
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
      easing: 'easeOutQuart',
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
        grid: {
          drawBorder: false,
          color: 'rgba(0,0,0,0.05)',
        },
      },
      y: {
        grid: {
          drawBorder: false,
          color: 'rgba(0,0,0,0.05)',
        },
        ticks: {
          autoSkip: false,
        },
      },
    },
    elements: {
      bar: {
        borderRadius: 8,
      },
    },
  };

  const barHeight = 20;
  const minHeight = 300;
  const chartHeight = Math.max(labels.length * barHeight, minHeight);

  return (
    <Card className="mb-4">
      <CardHeader>
        <h3 className="text-lg font-semibold">Frequency Analysis</h3>
      </CardHeader>
      <CardBody>
        {labels.length > 0 ? (
          <div className="w-full" style={{ height: chartHeight }}>
            <Bar data={data} options={options} />
          </div>
        ) : (
          <p>No data to display.</p>
        )}
      </CardBody>
    </Card>
  );
}

