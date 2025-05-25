import React from 'react';

export type IndexOfCoincidenceSettings = {
  mode: 'summary' | 'period';
  ngramSize?: number;
  ngramMode?: 'sliding' | 'block';
};

interface IndexOfCoincidenceSettingsFormProps {
  settings: IndexOfCoincidenceSettings;
  setSettings: (settings: IndexOfCoincidenceSettings) => void;
}

export default function IndexOfCoincidenceSettingsForm({ settings, setSettings }: IndexOfCoincidenceSettingsFormProps) {
  const { mode, ngramSize = 1, ngramMode = 'sliding' } = settings;

  const handleModeChange = (mode: 'summary' | 'period') => {
    setSettings({ ...settings, mode });
  };
  const handleNgramSizeChange = (size: number) => {
    setSettings({ ...settings, ngramSize: size });
  };
  const handleNgramModeChange = (ngramMode: 'sliding' | 'block') => {
    setSettings({ ...settings, ngramMode });
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
              max={10}
              value={ngramSize}
              onChange={e => handleNgramSizeChange(Math.max(1, Math.min(3, Number(e.target.value))))}
              className="p-2 border rounded text-sm w-24"
            />
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
    </div>
  );
}