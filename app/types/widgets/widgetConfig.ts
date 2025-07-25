export interface WidgetConfig<T = any> {
  id: string;
  name: string;
  description: string;
  settingsKey?: string;
  settingsType?: string; // TypeScript type name for the settings
  defaultSettings?: T;
  parser?: (value: any) => T;
  validator?: (settings: T) => boolean;
}