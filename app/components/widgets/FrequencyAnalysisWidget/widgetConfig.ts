import { WidgetConfig } from '@/types/widgets/widgetConfig';
import { FrequencyAnalysisSettings } from '@/types/dashboard/dashboardTypes';
import { DEFAULT_FREQUENCY_ANALYSIS_SETTINGS } from '@/utils/settings/dashboardSettings/dashboardSettingsManager';

const frequencyAnalysisConfig: WidgetConfig = {
  id: 'frequency-analysis',
  name: 'Frequency Analysis',
  description: 'Analyze character frequency in text',
  settingsKey: 'frequencyAnalysisSettings',
  settingsType: 'FrequencyAnalysisSettings',
  defaultSettings: DEFAULT_FREQUENCY_ANALYSIS_SETTINGS,
  parser: (value: any): FrequencyAnalysisSettings => ({
    ngramSize: value.ngramSize ?? 2,
    ngramMode: value.ngramMode ?? 'sliding',
    showTableView: value.showTableView ?? false,
    sortByInput: value.sortByInput,
    sortDirection: value.sortDirection,
  }),
  validator: (settings: any): boolean => {
    return (
      typeof settings.ngramSize === 'number' &&
      ['sliding', 'block'].includes(settings.ngramMode) &&
      (settings.showTableView === undefined || typeof settings.showTableView === 'boolean') &&
      (settings.sortByInput === undefined || (typeof settings.sortByInput === 'number' && settings.sortByInput >= 0)) &&
      (settings.sortDirection === undefined || ['asc', 'desc'].includes(settings.sortDirection))
    );
  },
};

export default frequencyAnalysisConfig;