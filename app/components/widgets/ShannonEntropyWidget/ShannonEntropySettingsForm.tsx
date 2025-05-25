import React from 'react';

interface ShannonEntropySettings {
  mode: 'raw' | 'sliding';
  windowSize: 16 | 32 | 64 | 128 | 256;
}

interface ShannonEntropySettingsFormProps {
  settings: ShannonEntropySettings;
  setSettings: (settings: ShannonEntropySettings) => void;
}

export default function ShannonEntropySettingsForm({ settings, setSettings }: ShannonEntropySettingsFormProps) {
  const { mode, windowSize } = settings;

  const handleModeChange = (mode: 'raw' | 'sliding') => {
    setSettings({ ...settings, mode });
  };
  const handleWindowSizeChange = (size: number) => {
    setSettings({ ...settings, windowSize: size as 16 | 32 | 64 | 128 | 256 });
  };

  return (
    <div>
      <div className="font-semibold text-lg mb-3">Display format</div>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="entropy-mode"
              value="raw"
              checked={mode === 'raw'}
              onChange={() => handleModeChange('raw')}
              className="w-4 h-4"
            />
            <span>Raw entropy</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="entropy-mode"
              value="sliding"
              checked={mode === 'sliding'}
              onChange={() => handleModeChange('sliding')}
              className="w-4 h-4"
            />
            <span>Sliding window</span>
          </label>
        </div>
        <div>
          <div className="font-semibold mb-2">Sliding window settings</div>
          <label className={`flex items-center gap-3 ${mode !== 'sliding' ? 'opacity-50' : ''}`}>
            <span className="min-w-[100px]">Window size:</span>
            <select
              value={windowSize}
              onChange={e => handleWindowSizeChange(Number(e.target.value))}
              className="p-2 border rounded text-sm w-24"
              disabled={mode !== 'sliding'}
            >
              {[16, 32, 64, 128, 256].map(sz => (
                <option key={sz} value={sz}>{sz}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}