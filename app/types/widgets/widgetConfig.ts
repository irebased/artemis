export interface WidgetConfig<T = any> {
  id: string;
  name: string;
  description: string;
  settingsKey?: string;
  defaultSettings?: T;
  parser?: (value: any) => T;
  validator?: (settings: T) => boolean;
}