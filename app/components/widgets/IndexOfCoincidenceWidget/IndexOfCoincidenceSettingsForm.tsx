import React from 'react';

export type IndexOfCoincidenceSettings = {
  mode: 'summary' | 'period';
};

interface IndexOfCoincidenceSettingsFormProps {
  settings: IndexOfCoincidenceSettings;
  setSettings: (settings: IndexOfCoincidenceSettings) => void;
}

export default function IndexOfCoincidenceSettingsForm({ settings, setSettings }: IndexOfCoincidenceSettingsFormProps) {
  const { mode } = settings;

  const handleModeChange = (mode: 'summary' | 'period') => {
    setSettings({ ...settings, mode });
  };

  return (
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
          <span>Period analysis</span>
        </label>
      </div>
    </div>
  );
}