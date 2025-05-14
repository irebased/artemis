import { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardBody } from '@heroui/react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import annotationPlugin from 'chartjs-plugin-annotation';

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartDataLabels,
  annotationPlugin
);

const IC_BASELINES = {
  ascii: { english: 0.065, random: 0.01805 },
  base64: { english: 0.02811, random: 0.01387 },
  hex: { english: 0.13985, random: 0.05714 },
  decimal: { english: 0.25448, random: 0.09769 },
  octal: { english: 0.20402, random: 0.12121 },
} as const;

function computeIC(text: string): number {
  if (!text || text.length < 2) return 0;
  const freq: Record<string, number> = {};
  for (const char of text) {
    freq[char] = (freq[char] || 0) + 1;
  }
  const total = text.length;
  const numerator = Object.values(freq).reduce((acc, f) => acc + f * (f - 1), 0);
  const denominator = total * (total - 1);
  return denominator > 0 ? numerator / denominator : 0;
}

function analyzePeriodIC(
  text: string,
  maxPeriod: number,
  langIC: number
): { period: number; averageIC: number }[] {
  const n = text.length;
  const results: { period: number; averageIC: number }[] = [];

  for (let period = 1; period <= maxPeriod; period++) {
    const groups: string[] = Array.from({ length: period }, () => '');

    for (let i = 0; i < n; i++) {
      groups[i % period] += text[i];
    }

    const avgIC = groups.reduce((sum, group) => sum + computeIC(group), 0) / groups.length;
    results.push({ period, averageIC: avgIC });
  }

  return results;
}

export function IndexOfCoincidenceWidget({
  text,
  base,
  view,
  onViewChange,
}: {
  text: string;
  base: keyof typeof IC_BASELINES;
  view: 'summary' | 'period';
  onViewChange: (view: 'summary' | 'period') => void;
}) {
  const baseline = IC_BASELINES[base];

  const { ic, total, freq } = useMemo(() => {
    const freq: Record<string, number> = {};
    for (const char of text) {
      freq[char] = (freq[char] || 0) + 1;
    }
    const total = text.length;
    const numerator = Object.values(freq).reduce((acc, f) => acc + f * (f - 1), 0);
    const denominator = total * (total - 1);
    const ic = denominator > 0 ? numerator / denominator : 0;
    return { ic, total, freq };
  }, [text]);

  const periodAnalysis = useMemo(() => {
    const maxPeriod = Math.min(100, Math.floor(text.length / 2));
    return analyzePeriodIC(text, maxPeriod, baseline.english);
  }, [text, baseline.english]);

  const maxEntry = periodAnalysis.reduce(
    (max, entry) => (entry.averageIC > max.averageIC ? entry : max),
    { period: 0, averageIC: 0 }
  );

  const periodChartData = {
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

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h3 className="text-lg font-semibold">Index of Coincidence</h3>
        <div className="flex items-center gap-2">
          <label className="font-medium">View:</label>
          <select
            value={view}
            onChange={(e) => onViewChange(e.target.value as 'summary' | 'period')}
            className="p-1 border rounded"
          >
            <option value="summary">Summary</option>
            <option value="period">Period Analysis</option>
          </select>
        </div>
      </CardHeader>
      <CardBody>
        {text ? (
          view === 'summary' ? (
            <div className="space-y-2 flex flex-col items-center">
              <div className="text-4xl font-bold">{ic.toFixed(5)}</div>
              <div className="text-sm text-gray-600 w-fit">
                <div className="flex justify-between gap-12">
                  <div>
                    <strong>English avg:</strong> {baseline.english.toFixed(5)}
                  </div>
                  <div>
                    <strong>Random avg:</strong> {baseline.random.toFixed(5)}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600 text-center">
                ({total} characters, {Object.keys(freq).length} unique)
              </div>
            </div>
          ) : (
            <div className="w-full" style={{ height: 300, padding: "20px 0px" }}>
              <Line
                data={periodChartData}
                options={{
                  plugins: {
                    legend: { display: true },
                    datalabels: { display: false },
                    tooltip: {
                      callbacks: {
                        afterBody: (ctx) => {
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
                    },
                    x: {
                      grid: { color: 'rgba(0,0,0,0.05)' },
                    },
                  },
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
              <p className="text-sm text-center text-gray-600 mt-2">
                Peak IC at period <strong>{maxEntry.period}</strong>: {maxEntry.averageIC.toFixed(5)}
              </p>
            </div>
          )
        ) : (
          <p>No input provided.</p>
        )}
      </CardBody>
    </Card>
  );
}
