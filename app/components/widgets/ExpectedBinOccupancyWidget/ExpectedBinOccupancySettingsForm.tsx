import React from 'react';
import { Input, Switch } from '@heroui/react';
import { ExpectedBinOccupancySettings } from '@/types/dashboard/dashboardTypes';

interface ExpectedBinOccupancySettingsFormProps {
  settings: ExpectedBinOccupancySettings;
  onSettingsChange: (settings: ExpectedBinOccupancySettings) => void;
}

export function ExpectedBinOccupancySettingsForm({
  settings,
  onSettingsChange,
}: ExpectedBinOccupancySettingsFormProps) {
  const handleConfidenceLevelChange = (value: string) => {
    onSettingsChange({
      ...settings,
      confidenceLevel: parseFloat(value),
    });
  };

  const handleShowConfidenceBandsChange = (checked: boolean) => {
    onSettingsChange({
      ...settings,
      showConfidenceBands: checked,
    });
  };

  const handleShowExpectedCurveChange = (checked: boolean) => {
    onSettingsChange({
      ...settings,
      showExpectedCurve: checked,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Confidence Level
        </label>
        <select
          value={settings.confidenceLevel.toString()}
          onChange={(e) => handleConfidenceLevelChange(e.target.value)}
          className="w-full px-3 py-2 bg-background border border-default-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="0.68">68% (1σ)</option>
          <option value="0.95">95% (2σ)</option>
          <option value="0.997">99.7% (3σ)</option>
        </select>
      </div>

      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Show Confidence Bands
        </label>
        <Switch
          isSelected={settings.showConfidenceBands}
          onValueChange={handleShowConfidenceBandsChange}
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Show Expected Curve
        </label>
        <Switch
          isSelected={settings.showExpectedCurve}
          onValueChange={handleShowExpectedCurveChange}
        />
      </div>
    </div>
  );
}