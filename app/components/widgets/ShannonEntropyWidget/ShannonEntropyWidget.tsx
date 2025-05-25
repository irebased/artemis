import { Line } from 'react-chartjs-2';
import { InputData } from '@/app/useDashboardParams';
import { useShannonEntropy, ENTROPY_BASELINES, BaseType } from './useShannonEntropy';
import { useShannonEntropyChart, defaultGridSize } from './useShannonEntropyChart';

interface ShannonEntropyWidgetProps {
  texts: InputData[];
  base: BaseType;
  width?: number;
  height?: number;
  mode: 'raw' | 'sliding';
  windowSize: number;
  onModeChange: (mode: 'raw' | 'sliding') => void;
  onWindowSizeChange: (size: number) => void;
}

export default function ShannonEntropyWidget({
  texts,
  base,
  width,
  height,
  mode,
  windowSize,
  onModeChange,
  onWindowSizeChange,
}: ShannonEntropyWidgetProps) {
  const results = useShannonEntropy(texts, windowSize);
  const { data: slidingLineData, options: slidingLineOptions } = useShannonEntropyChart(results, windowSize);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4 flex flex-row items-center justify-between gap-2">
        <h3 className="text-lg font-semibold mb-0">Shannon Entropy</h3>
        {mode === 'sliding' && (
          <div className="flex items-center gap-2">
            <label className="mr-2">Window Size:</label>
            <select
              value={windowSize}
              onChange={e => onWindowSizeChange(Number(e.target.value))}
              className="p-2 border rounded"
            >
              {[16, 32, 64, 128, 256].map(sz => (
                <option key={sz} value={sz}>{sz}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <select
            value={mode}
            onChange={(e) => onModeChange(e.target.value as 'raw' | 'sliding')}
            className="p-2 border rounded"
          >
            <option value="raw">Raw Entropy</option>
            <option value="sliding">Sliding Window</option>
          </select>
        </div>
      </div>
      {mode === 'raw' ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2">Text</th>
                <th className="text-left p-2">Entropy</th>
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
                  <td className="p-2 font-bold text-2xl" style={{ color: r.color }}>{r.entropy.toFixed(5)}</td>
                  <td className="p-2 text-gray-400">{r.total}</td>
                  <td className="p-2 text-gray-400">{r.unique}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex-1 w-full h-full relative">
          {slidingLineData ? (
            <Line data={slidingLineData} options={slidingLineOptions} className="absolute inset-0 w-full h-full" />
          ) : (
            <p>No data to display.</p>
          )}
        </div>
      )}
    </div>
  );
}
