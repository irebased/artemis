import { WidgetConfig } from '@/types/widgets/widgetConfig';
import { IndexOfCoincidenceSettings } from '@/types/dashboard/dashboardTypes';

export const indexOfCoincidenceWidgetConfig: WidgetConfig = {
  id: 'index-of-coincidence',
  name: 'Index of Coincidence',
  description: 'Calculate the index of coincidence for text analysis',
  settingsKey: 'indexOfCoincidenceSettings',
  settingsType: 'IndexOfCoincidenceSettings',
  defaultSettings: {
    mode: 'summary',
    ngramSize: 1,
    ngramMode: 'sliding',
    showAverageLines: true,
    maxPeriod: 20,
  },
  parser: (value: any): IndexOfCoincidenceSettings => ({
    mode: value.mode ?? 'summary',
    ngramSize: value.ngramSize ?? 1,
    ngramMode: value.ngramMode ?? 'sliding',
    showAverageLines: value.showAverageLines ?? true,
    maxPeriod: value.maxPeriod ?? 20,
  }),
  validator: (settings: IndexOfCoincidenceSettings): boolean => {
    return (
      ['summary', 'period'].includes(settings.mode) &&
      (!settings.ngramSize || (typeof settings.ngramSize === 'number' && settings.ngramSize >= 1)) &&
      (!settings.ngramMode || ['sliding', 'block'].includes(settings.ngramMode)) &&
      (settings.showAverageLines === undefined || typeof settings.showAverageLines === 'boolean') &&
      (!settings.maxPeriod || (typeof settings.maxPeriod === 'number' && settings.maxPeriod > 0))
    );
  },
};

export default indexOfCoincidenceWidgetConfig;