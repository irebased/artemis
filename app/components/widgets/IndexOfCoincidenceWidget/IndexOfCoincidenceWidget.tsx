import { Line } from 'react-chartjs-2';
import { InputData } from '@/app/useDashboardParams';
import { BaseType } from '@/types/bases';
import { useIndexOfCoincidence, IC_BASELINES } from './useIndexOfCoincidence';
import { useIndexOfCoincidenceChart } from './useIndexOfCoincidenceChart';

interface IndexOfCoincidenceWidgetProps {
  texts: InputData[];
  base: BaseType;
  width?: number;
  height?: number;
  view: 'summary' | 'period';
  onViewChange: (view: 'summary' | 'period') => void;
}

export default function IndexOfCoincidenceWidget({
  texts,
  base,
  width,
  height,
  view,
  onViewChange,
}: IndexOfCoincidenceWidgetProps) {
  const baseline = IC_BASELINES[base];
  const results = useIndexOfCoincidence(texts, base);
  const { data: periodLineData, options: lineOptions } = useIndexOfCoincidenceChart(results, view, baseline);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4 flex flex-row items-center justify-between gap-2">
        <h3 className="text-lg font-semibold mb-0">Index of Coincidence</h3>
        <div>
          <label className="mr-2">View:</label>
          <select
            value={view}
            onChange={(e) => onViewChange(e.target.value as 'summary' | 'period')}
            className="p-2 border rounded"
          >
            <option value="summary">Summary</option>
            <option value="period">Periodic Analysis</option>
          </select>
        </div>
      </div>
      {view === 'summary' ? (
        <div className="overflow-x-auto">
          <div className="flex gap-8 mb-2 text-gray-400">
            <span>English avg: <span className="font-mono">{baseline.english.toFixed(5)}</span></span>
            <span>Random avg: <span className="font-mono">{baseline.random.toFixed(5)}</span></span>
          </div>
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2">Text</th>
                <th className="text-left p-2">IC</th>
                <th className="text-left p-2">Total chars</th>
                <th className="text-left p-2">Unique chars</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td className="p-2" style={{ color: r.color }}>
                    {r.text.slice(0, 20)}{r.text.length > 20 ? '...' : ''}
                  </td>
                  <td className="p-2 font-bold text-2xl" style={{ color: r.color }}>{r.ic.toFixed(5)}</td>
                  <td className="p-2 text-gray-400">{r.total}</td>
                  <td className="p-2 text-gray-400">{r.unique}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex-1 w-full h-full relative">
          {periodLineData ? (
            <Line data={periodLineData} options={lineOptions} className="absolute inset-0 w-full h-full" />
          ) : (
            <p>No data to display.</p>
          )}
        </div>
      )}
    </div>
  );
}
