import { WidgetConfig } from '@/types/widgets/widgetConfig';
import { AsciiDistributionSettings } from '@/types/dashboard/dashboardTypes';
import { DEFAULT_ASCII_DISTRIBUTION_SETTINGS } from '@/utils/settings/dashboardSettings/dashboardSettingsManager';

const asciiDistributionConfig: WidgetConfig = {
  id: 'ascii-distribution',
  name: 'ASCII Distribution',
  description: 'Analyze ASCII character distribution',
  settingsKey: 'asciiDistributionSettings',
  defaultSettings: DEFAULT_ASCII_DISTRIBUTION_SETTINGS,
  parser: (value: any): AsciiDistributionSettings => ({
    range: value.range ?? 'extended',
  }),
  validator: (settings: any): boolean => {
    return ['extended', 'ascii', 'input'].includes(settings.range);
  },
};

export default asciiDistributionConfig;