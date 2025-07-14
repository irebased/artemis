import { WidgetConfig } from '@/types/widgets/widgetConfig';
import { FrequencyAnalysisSettings } from '@/types/dashboard/dashboardTypes';
import { DEFAULT_FREQUENCY_ANALYSIS_SETTINGS } from '@/utils/settings/dashboardSettings/dashboardSettingsManager';

const frequencyAnalysisConfig: WidgetConfig = {
  id: 'frequency-analysis',
  name: 'Frequency Analysis',
  description: 'Analyze character frequency in text',
  settingsKey: 'frequencyAnalysisSettings',
  defaultSettings: DEFAULT_FREQUENCY_ANALYSIS_SETTINGS,
  parser: (value: any): FrequencyAnalysisSettings => ({
    ngramSize: value.ngramSize ?? 2,
    ngramMode: value.ngramMode ?? 'sliding',
  }),
  validator: (settings: any): boolean => {
    return (
      typeof settings.ngramSize === 'number' &&
      ['sliding', 'block'].includes(settings.ngramMode)
    );
  },
};

export default frequencyAnalysisConfig;