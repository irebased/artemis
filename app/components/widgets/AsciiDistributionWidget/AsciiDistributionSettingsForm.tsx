import React from 'react';

export type AsciiDistributionSettings = {
  range: 'extended' | 'ascii' | 'input';
};

interface AsciiDistributionSettingsFormProps {
  settings: AsciiDistributionSettings;
  setSettings: (settings: AsciiDistributionSettings) => void;
}

export default function AsciiDistributionSettingsForm({ settings, setSettings }: AsciiDistributionSettingsFormProps) {
  const { range } = settings;

  const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings({ ...settings, range: e.target.value as AsciiDistributionSettings['range'] });
  };

  return (
    <div>
      <div className="font-semibold text-lg mb-3">ASCII Range</div>
      <label className="flex items-center gap-3">
        <span className="min-w-[100px]">Range:</span>
        <select
          value={range}
          onChange={handleRangeChange}
          className="p-2 border rounded text-sm w-40"
        >
          <option value="extended">Full (0-255)</option>
          <option value="ascii">ASCII (0-127)</option>
          <option value="input">Input Range</option>
        </select>
      </label>
    </div>
  );
}