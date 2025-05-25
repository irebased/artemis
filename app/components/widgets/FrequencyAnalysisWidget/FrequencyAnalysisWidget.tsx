// @ts-nocheck
import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { Ciphertext } from '@/types/ciphertext';
import { useFrequencyAnalysis, defaultGridSize } from './useFrequencyAnalysis';
import { useFrequencyAnalysisChart } from './useFrequencyAnalysisChart';

interface FrequencyAnalysisWidgetProps {
  inputs: Ciphertext[];
  width?: number;
  height?: number;
  gridH?: number;
  frequencyAnalysisSettings: { ngramSize: number; ngramMode: 'sliding' | 'block' };
  setFrequencyAnalysisSettings: (settings: { ngramSize: number; ngramMode: 'sliding' | 'block' }) => void;
}

export default function FrequencyAnalysisWidget({ inputs, width, height, gridH, frequencyAnalysisSettings, setFrequencyAnalysisSettings }: FrequencyAnalysisWidgetProps) {
  const [showSettings, setShowSettings] = useState(false);
  const { ngramSize, ngramMode } = frequencyAnalysisSettings;
  const analysis = useFrequencyAnalysis(inputs, ngramSize, ngramMode);
  const { data, options } = useFrequencyAnalysisChart(analysis);

  const handleNgramSizeChange = (n: number) => {
    setFrequencyAnalysisSettings({ ...frequencyAnalysisSettings, ngramSize: n });
  };
  const handleNgramModeChange = (mode: 'sliding' | 'block') => {
    setFrequencyAnalysisSettings({ ...frequencyAnalysisSettings, ngramMode: mode });
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Frequency Analysis</h3>
        <button
          className="px-3 py-1 border rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => setShowSettings(true)}
        >
          Settings
        </button>
      </div>
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-lg min-w-[300px]">
            <h4 className="text-lg font-semibold mb-4">Frequency Analysis Settings</h4>
            <div className="mb-4 flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <span>n-gram size:</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={ngramSize}
                  onChange={e => handleNgramSizeChange(Math.max(1, Math.min(10, Number(e.target.value))))}
                  className="w-16 p-1 border rounded text-sm"
                />
              </label>
              <label className="flex items-center gap-2">
                <span>Mode:</span>
                <select
                  value={ngramMode}
                  onChange={e => handleNgramModeChange(e.target.value as 'sliding' | 'block')}
                  className="p-1 border rounded text-sm"
                >
                  <option value="sliding">Sliding window</option>
                  <option value="block">Block</option>
                </select>
              </label>
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
      <div className="flex-1 w-full h-full relative">
        {data && data.labels.length > 0 ? (
          <Bar data={data} options={options} className="absolute inset-0 w-full h-full" />
        ) : (
          <p>No data to display.</p>
        )}
      </div>
    </div>
  );
}

