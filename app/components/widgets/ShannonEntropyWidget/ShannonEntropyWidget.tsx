import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Ciphertext } from '@/types/ciphertext';
import { useShannonEntropy, ENTROPY_BASELINES, BaseType } from './useShannonEntropy';
import { useShannonEntropyChart, defaultGridSize } from './useShannonEntropyChart';

interface ShannonEntropyWidgetProps {
  inputs: Ciphertext[];
  base: BaseType;
  width?: number;
  height?: number;
  shannonEntropySettings: { mode: 'raw' | 'sliding'; windowSize: 16 | 32 | 64 | 128 | 256 };
  setShannonEntropySettings: (settings: { mode: 'raw' | 'sliding'; windowSize: 16 | 32 | 64 | 128 | 256 }) => void;
}

export default function ShannonEntropyWidget({
  inputs,
  base,
  width,
  height,
  shannonEntropySettings,
  setShannonEntropySettings,
}: ShannonEntropyWidgetProps) {
  const [showSettings, setShowSettings] = useState(false);
  const { mode, windowSize } = shannonEntropySettings;
  const results = useShannonEntropy(inputs, windowSize);
  const { data: slidingLineData, options: slidingLineOptions } = useShannonEntropyChart(results, windowSize);

  const handleModeChange = (mode: 'raw' | 'sliding') => {
    setShannonEntropySettings({ ...shannonEntropySettings, mode });
  };
  const handleWindowSizeChange = (size: number) => {
    setShannonEntropySettings({ ...shannonEntropySettings, windowSize: size as 16 | 32 | 64 | 128 | 256 });
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4 flex flex-row items-center justify-between gap-2">
        <h3 className="text-lg font-semibold mb-0">Shannon Entropy</h3>
        <button
          className="px-3 py-1 border rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => setShowSettings(true)}
        >
          Settings
        </button>
      </div>
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-lg min-w-[320px]">
            <h4 className="text-lg font-semibold mb-4">Shannon Entropy Settings</h4>
            <div className="mb-4 flex flex-col gap-4">
              <div>
                <div className="font-semibold mb-1">Display format</div>
                <label className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    name="entropy-mode"
                    value="raw"
                    checked={mode === 'raw'}
                    onChange={() => handleModeChange('raw')}
                  />
                  Raw entropy
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="entropy-mode"
                    value="sliding"
                    checked={mode === 'sliding'}
                    onChange={() => handleModeChange('sliding')}
                  />
                  Sliding window
                </label>
              </div>
              {mode === 'sliding' && (
                <div>
                  <div className="font-semibold mb-1">Sliding window settings</div>
                  <label className="flex items-center gap-2">
                    <span>Window size:</span>
                    <select
                      value={windowSize}
                      onChange={e => handleWindowSizeChange(Number(e.target.value))}
                      className="p-1 border rounded text-sm"
                    >
                      {[16, 32, 64, 128, 256].map(sz => (
                        <option key={sz} value={sz}>{sz}</option>
                      ))}
                    </select>
                  </label>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 border rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setShowSettings(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {mode === 'raw' ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2">Text</th>
                <th className="text-left p-2">Entropy</th>
                <th className="text-left p-2">English baseline</th>
                <th className="text-left p-2">Random text baseline</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td className="p-2" style={{ color: r.color }}>
                  <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: r.color, display: 'inline-block' }} />
                    {r.text.slice(0, 7)}{r.text.length > 7 ? '...' : ''}
                  </td>
                  <td className="p-2 font-bold">{r.entropy.toFixed(4)}</td>
                  <td className="p-2 text-gray-400">{r.baseline.toFixed(4)}</td>
                  <td className="p-2 text-gray-400">{r.randomBaseline.toFixed(4)}</td>
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
