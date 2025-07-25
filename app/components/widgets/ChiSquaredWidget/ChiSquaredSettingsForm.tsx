import React from 'react';
import { Ciphertext } from '@/types/ciphertext';
import { getProcessedText } from '@/utils/textUtils';

export type ChiSquaredSettings = {
  selectedTextIndex: number;
  baseDataIndex: number | 'sample';
};

interface ChiSquaredSettingsFormProps {
  settings: ChiSquaredSettings;
  setSettings: (settings: ChiSquaredSettings) => void;
  inputs: Ciphertext[];
}

export default function ChiSquaredSettingsForm({
  settings,
  setSettings,
  inputs
}: ChiSquaredSettingsFormProps) {
  const { selectedTextIndex, baseDataIndex } = settings;

  const handleSelectedTextChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newIndex = parseInt(e.target.value);
    setSettings({ ...settings, selectedTextIndex: newIndex });
  };

  const handleBaseDataChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const newBaseIndex = value === 'sample' ? 'sample' : parseInt(value);
    setSettings({ ...settings, baseDataIndex: newBaseIndex });
  };

  return (
    <div>
      <div className="font-semibold text-lg mb-3">Chi-Squared Test Settings</div>

      <div className="space-y-4">
        <label className="flex items-center gap-3">
          <span className="min-w-[120px]">Text to evaluate:</span>
          <select
            value={selectedTextIndex}
            onChange={handleSelectedTextChange}
            className="p-2 border rounded text-sm w-40"
          >
            {inputs.map((input, index) => {
              const processed = getProcessedText(input);
              return (
                <option key={index} value={index}>
                  {processed.slice(0, 20) + (processed.length > 20 ? '...' : '')}
                </option>
              );
            })}
          </select>
        </label>

        <label className="flex items-center gap-3">
          <span className="min-w-[120px]">Base data:</span>
          <select
            value={baseDataIndex === 'sample' ? 'sample' : baseDataIndex.toString()}
            onChange={handleBaseDataChange}
            className="p-2 border rounded text-sm w-40"
          >
            <option value="sample">Sample text</option>
            {inputs.map((input, index) => {
              const processed = getProcessedText(input);
              return (
                <option key={index} value={index}>
                  {processed.slice(0, 20) + (processed.length > 20 ? '...' : '')}
                </option>
              );
            })}
          </select>
        </label>
      </div>
    </div>
  );
}