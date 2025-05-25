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
import { useFrequencyAnalysis } from './useFrequencyAnalysis';
import { useFrequencyAnalysisChart } from './useFrequencyAnalysisChart';
import Modal from '@/components/Modal';

interface FrequencyAnalysisWidgetProps {
  inputs: Ciphertext[];
  gridH?: number;
  frequencyAnalysisSettings: { ngramSize: number; ngramMode: 'sliding' | 'block' };
  setFrequencyAnalysisSettings: (settings: { ngramSize: number; ngramMode: 'sliding' | 'block' }) => void;
}

export default function FrequencyAnalysisWidget({
  inputs,
  gridH,
  frequencyAnalysisSettings,
  setFrequencyAnalysisSettings,
}: FrequencyAnalysisWidgetProps) {
  const [showSettings, setShowSettings] = useState(false);
  const { ngramSize, ngramMode } = frequencyAnalysisSettings;
  const results = useFrequencyAnalysis(inputs, ngramSize, ngramMode);
  const { data: barData, options: barOptions } = useFrequencyAnalysisChart(results, ngramSize);

  const handleNgramSizeChange = (size: number) => {
    setFrequencyAnalysisSettings({ ...frequencyAnalysisSettings, ngramSize: size });
  };

  const handleNgramModeChange = (mode: 'sliding' | 'block') => {
    setFrequencyAnalysisSettings({ ...frequencyAnalysisSettings, ngramMode: mode });
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4 flex flex-row items-center justify-between gap-2">
        <h3 className="text-lg font-semibold mb-0">Frequency Analysis</h3>
        <button
          className="px-3 py-1 border rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => setShowSettings(true)}
        >
          Settings
        </button>
      </div>
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Frequency Analysis Settings"
      >
        <div>
          <div className="font-semibold text-lg mb-3">N-gram settings</div>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-3">
                <span className="min-w-[60px]">Size:</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={ngramSize}
                  onChange={e => handleNgramSizeChange(Math.max(1, Math.min(10, Number(e.target.value))))}
                  className="p-2 border rounded text-sm w-24"
                />
              </label>
            </div>
            <div>
              <div className="font-semibold mb-2">Mode:</div>
              <div className="space-y-2">
                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="ngram-mode"
                    value="sliding"
                    checked={ngramMode === 'sliding'}
                    onChange={() => handleNgramModeChange('sliding')}
                    className="w-4 h-4"
                  />
                  <span>Sliding window</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="ngram-mode"
                    value="block"
                    checked={ngramMode === 'block'}
                    onChange={() => handleNgramModeChange('block')}
                    className="w-4 h-4"
                  />
                  <span>Block</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <div className="flex-1 w-full h-full relative">
        {barData ? (
          <Bar data={barData} options={barOptions} className="absolute inset-0 w-full h-full" />
        ) : (
          <p>No data to display.</p>
        )}
      </div>
    </div>
  );
}

