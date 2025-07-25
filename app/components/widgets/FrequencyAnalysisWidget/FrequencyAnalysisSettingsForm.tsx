import React from 'react';
import { Ciphertext } from '@/types/ciphertext';

interface FrequencyAnalysisSettings {
  ngramSize: number;
  ngramMode: 'sliding' | 'block';
  showTableView?: boolean;
  sortByInput?: number;
  sortDirection?: 'asc' | 'desc';
}

interface FrequencyAnalysisSettingsFormProps {
  settings: FrequencyAnalysisSettings;
  setSettings: (settings: FrequencyAnalysisSettings) => void;
  inputs: Ciphertext[];
}

export default function FrequencyAnalysisSettingsForm({ settings, setSettings, inputs }: FrequencyAnalysisSettingsFormProps) {
  const { ngramSize, ngramMode, showTableView = false, sortByInput, sortDirection } = settings;

  const handleNgramSizeChange = (size: number) => {
    setSettings({ ...settings, ngramSize: size });
  };

  const handleNgramModeChange = (mode: 'sliding' | 'block') => {
    setSettings({ ...settings, ngramMode: mode });
  };

  const handleShowTableViewChange = (show: boolean) => {
    setSettings({ ...settings, showTableView: show });
  };

  return (
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
      <div className="mt-6">
        <div className="font-semibold text-lg mb-3">Display options</div>
        <div className="space-y-2">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={showTableView}
              onChange={(e) => handleShowTableViewChange(e.target.checked)}
              className="w-4 h-4"
            />
            <span>Show table view</span>
          </label>
        </div>
      </div>
      <div className="mt-6">
        <div className="font-semibold text-lg mb-3">Sort options</div>
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Choose which input to sort by and the direction:
          </p>
          <div className="space-y-2">
            <label className="flex items-center gap-3">
              <span className="min-w-[80px] text-sm">Sort by:</span>
              <select
                value={sortByInput?.toString() || 'none'}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'none') {
                    setSettings({ ...settings, sortByInput: undefined, sortDirection: undefined });
                  } else {
                    const newInputIndex = parseInt(value);
                    setSettings({
                      ...settings,
                      sortByInput: newInputIndex,
                      sortDirection: sortDirection || 'desc'
                    });
                  }
                }}
                className="p-1 border rounded text-sm"
              >
                <option value="none">No sort</option>
                {inputs.map((input, index) => {
                  const displayText = input.text.length > 7
                    ? `${input.text.slice(0, 7)}...`
                    : input.text || `Input ${index + 1}`;
                  return (
                    <option key={index} value={index}>
                      {displayText}
                    </option>
                  );
                })}
              </select>
            </label>
            {sortByInput !== undefined && (
              <label className="flex items-center gap-3">
                <span className="min-w-[80px] text-sm">Direction:</span>
                <select
                  value={sortDirection || 'desc'}
                  onChange={(e) => setSettings({ ...settings, sortDirection: e.target.value as 'asc' | 'desc' })}
                  className="p-1 border rounded text-sm"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}