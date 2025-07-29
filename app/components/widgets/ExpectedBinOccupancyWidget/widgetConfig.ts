import { WidgetConfig } from '@/types/widgets/widgetConfig';
import { ExpectedBinOccupancySettings } from '@/types/dashboard/dashboardTypes';

const config: WidgetConfig<ExpectedBinOccupancySettings> = {
  id: 'expected-bin-occupancy',
  name: 'Expected Bin Occupancy',
  description: 'Analyzes character frequency distributions with expected curves and confidence bands',
  settingsKey: 'expectedBinOccupancySettings',
  settingsType: 'ExpectedBinOccupancySettings',
  defaultSettings: {
    confidenceLevel: 0.95,
    showConfidenceBands: true,
    showExpectedCurve: true,
  },
  parser: (value: any): ExpectedBinOccupancySettings => ({
    confidenceLevel: value?.confidenceLevel ?? 0.95,
    showConfidenceBands: value?.showConfidenceBands ?? true,
    showExpectedCurve: value?.showExpectedCurve ?? true,
  }),
  validator: (settings: ExpectedBinOccupancySettings): boolean => {
    return (
      typeof settings.confidenceLevel === 'number' &&
      settings.confidenceLevel >= 0.68 &&
      settings.confidenceLevel <= 0.997 &&
      typeof settings.showConfidenceBands === 'boolean' &&
      typeof settings.showExpectedCurve === 'boolean'
    );
  },
};

export default config;