import { WidgetConfig } from '@/types/widgets/widgetConfig';
import { ShannonEntropySettings } from '@/types/dashboard/dashboardTypes';
import { DEFAULT_SHANNON_ENTROPY_SETTINGS } from '@/utils/settings/dashboardSettings/dashboardSettingsManager';

const shannonEntropyConfig: WidgetConfig = {
  id: 'shannon-entropy',
  name: 'Shannon Entropy',
  description: 'Calculate information entropy',
  settingsKey: 'shannonEntropySettings',
  defaultSettings: DEFAULT_SHANNON_ENTROPY_SETTINGS,
  parser: (value: any): ShannonEntropySettings => ({
    mode: value.mode ?? 'raw',
    windowSize: value.windowSize ?? 64,
  }),
  validator: (settings: any): boolean => {
    return (
      ['raw', 'sliding'].includes(settings.mode) &&
      [16, 32, 64, 128, 256].includes(settings.windowSize)
    );
  },
};

export default shannonEntropyConfig;