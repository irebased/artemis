import React from 'react';
import { IndexOfCoincidenceSettings } from '@/types/dashboard/dashboardTypes';

interface IndexOfCoincidenceSettingsFormProps {
  settings: IndexOfCoincidenceSettings;
  setSettings: (settings: IndexOfCoincidenceSettings) => void;
}

export default function IndexOfCoincidenceSettingsForm({ settings, setSettings }: IndexOfCoincidenceSettingsFormProps) {
  const { mode, ngramSize = 1, ngramMode = 'sliding', showAverageLines = true, maxPeriod = 20 } = settings;

  const handleModeChange = (mode: 'summary' | 'period') => {
    setSettings({ ...settings, mode });
  };
  const handleNgramSizeChange = (size: number) => {
    const validSize = Math.max(1, Math.floor(size));
    setSettings({ ...settings, ngramSize: validSize });
  };
  const handleNgramModeChange = (ngramMode: 'sliding' | 'block') => {
    setSettings({ ...settings, ngramMode });
  };
  const handleShowAverageLinesChange = (show: boolean) => {
    setSettings({ ...settings, showAverageLines: show });
  };
  const handleMaxPeriodChange = (maxPeriod: number) => {
    const validMaxPeriod = Math.max(1, Math.floor(maxPeriod));
    setSettings({ ...settings, maxPeriod: validMaxPeriod });
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="font-semibold text-lg mb-3">Display mode</div>
        <div className="space-y-2">
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="ic-mode"
              value="summary"
              checked={mode === 'summary'}
              onChange={() => handleModeChange('summary')}
              className="w-4 h-4"
            />
            <span>Summary table</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="ic-mode"
              value="period"
              checked={mode === 'period'}
              onChange={() => handleModeChange('period')}
              className="w-4 h-4"
            />
            <span>Period analysis (line chart)</span>
          </label>
        </div>
      </div>
      <div>
        <div className="font-semibold text-lg mb-3">N-gram settings</div>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <span className="min-w-[60px]">Size:</span>
            <input
              type="number"
              min={1}
              value={ngramSize}
              onChange={e => handleNgramSizeChange(Number(e.target.value))}
              className="p-2 border rounded text-sm w-24"
            />
            <span className="text-sm text-gray-500">
              {ngramSize === 1 ? '(single characters)' : ngramSize === 2 ? '(bigrams)' : `(${ngramSize}-grams)`}
            </span>
          </label>
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
      {mode === 'period' && (
        <div>
          <div className="font-semibold text-lg mb-3">Chart options</div>
          <div className="space-y-2">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={showAverageLines}
                onChange={(e) => handleShowAverageLinesChange(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Show average lines</span>
            </label>
            <label className="flex items-center gap-3">
              <span className="min-w-[60px]">Max period:</span>
              <input
                type="number"
                min={1}
                value={maxPeriod}
                onChange={e => handleMaxPeriodChange(Number(e.target.value))}
                className="p-2 border rounded text-sm w-24"
              />
              <span className="text-sm text-gray-500">
                (default: {20})
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}