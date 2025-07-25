import { WidgetConfig } from '@/types/widgets/widgetConfig';
import { ChiSquaredSettings } from '@/types/dashboard/dashboardTypes';

export const chiSquaredWidgetConfig: WidgetConfig = {
  id: 'chi-squared',
  name: 'Chi-Squared Test',
  description: 'Perform Chi-squared statistical test',
  settingsKey: 'chiSquaredSettings',
  settingsType: 'ChiSquaredSettings',
  defaultSettings: {
    selectedTextIndex: 0,
    baseDataIndex: 'sample',
  },
  parser: (value: any): ChiSquaredSettings => ({
    selectedTextIndex: value.selectedTextIndex ?? 0,
    baseDataIndex: value.baseDataIndex ?? 'sample',
  }),
  validator: (settings: ChiSquaredSettings): boolean => {
    return (
      typeof settings.selectedTextIndex === 'number' &&
      settings.selectedTextIndex >= 0 &&
      (typeof settings.baseDataIndex === 'number' || settings.baseDataIndex === 'sample')
    );
  },
};

export default chiSquaredWidgetConfig;