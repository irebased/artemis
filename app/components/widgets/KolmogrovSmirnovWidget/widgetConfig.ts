import { WidgetConfig } from '@/types/widgets/widgetConfig';
import { KolmogorovSmirnovSettings } from '@/types/dashboard/dashboardTypes';
import { DEFAULT_KOLMOGOROV_SMIRNOV_SETTINGS } from '@/utils/settings/dashboardSettings/dashboardSettingsManager';

const kolmogorovSmirnovWidgetConfig: WidgetConfig = {
  id: 'kolmogorov-smirnov',
  name: 'Kolmogorov-Smirnov Test',
  description: 'Perform Kolmogorov-Smirnov statistical test',
  settingsKey: 'kolmogorovSmirnovSettings',
  settingsType: 'KolmogorovSmirnovSettings',
  defaultSettings: DEFAULT_KOLMOGOROV_SMIRNOV_SETTINGS,
  parser: (value: any): KolmogorovSmirnovSettings => ({
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

export default kolmogorovSmirnovWidgetConfig;