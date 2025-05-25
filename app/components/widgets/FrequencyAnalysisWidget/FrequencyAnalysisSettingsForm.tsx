import React from 'react';

interface FrequencyAnalysisSettings {
  ngramSize: number;
  ngramMode: 'sliding' | 'block';
}

interface FrequencyAnalysisSettingsFormProps {
  settings: FrequencyAnalysisSettings;
  setSettings: (settings: FrequencyAnalysisSettings) => void;
}

export default function FrequencyAnalysisSettingsForm({ settings, setSettings }: FrequencyAnalysisSettingsFormProps) {
  const { ngramSize, ngramMode } = settings;

  const handleNgramSizeChange = (size: number) => {
    setSettings({ ...settings, ngramSize: size });
  };

  const handleNgramModeChange = (mode: 'sliding' | 'block') => {
    setSettings({ ...settings, ngramMode: mode });
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
    </div>
  );
}