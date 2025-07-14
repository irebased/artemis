import { ParsedUrlParameters } from '@/utils/urlParsing/urlParameterParser';
import { WIDGET_REGISTRY } from '@/components/widgets/widgetRegistry';
import { WidgetConfig } from '@/types/widgets/widgetConfig';

export interface WidgetSettings {
  [widgetId: string]: any;
}

/**
 * Process widget settings from URL parameters using the widget registry
 * @param params Parsed URL parameters
 * @returns Processed widget settings
 */
export function processWidgetSettings(params: ParsedUrlParameters): WidgetSettings {
  const updates: WidgetSettings = {};

  WIDGET_REGISTRY.forEach((config: WidgetConfig) => {
    if (!config.settingsKey) return; // Skip widgets without settings
    const settings = params[config.settingsKey];
    if (settings) {
      // Apply parser if available
      const processedSettings = config.parser ? config.parser(settings) : settings;

      // Apply validator if available
      if (config.validator && !config.validator(processedSettings)) {
        console.warn(`Invalid settings for widget ${config.id}:`, processedSettings);
        return; // Skip invalid settings
      }

      updates[config.id] = processedSettings;
    }
  });

  return updates;
}

/**
 * Validate widget settings using widget-owned validators
 * @param settings Widget settings to validate
 * @returns Boolean indicating if all settings are valid
 */
export function validateWidgetSettings(settings: WidgetSettings): boolean {
  let isValid = true;

  Object.entries(settings).forEach(([widgetId, widgetSettings]) => {
    const config = WIDGET_REGISTRY.get(widgetId);
    if (config?.validator && !config.validator(widgetSettings)) {
      console.error(`Invalid settings for widget ${widgetId}:`, widgetSettings);
      isValid = false;
    }
  });

  return isValid;
}

/**
 * Get default settings for all registered widgets
 * @returns Default settings object
 */
export function getDefaultWidgetSettings(): WidgetSettings {
  const defaults: WidgetSettings = {};
  WIDGET_REGISTRY.forEach((config: WidgetConfig) => {
    if (config.settingsKey && config.defaultSettings !== undefined) {
      defaults[config.id] = config.defaultSettings;
    }
  });
  return defaults;
}

/**
 * Get settings for a specific widget
 * @param widgetId Widget ID
 * @param settings All widget settings
 * @returns Settings for the specific widget or undefined
 */
export function getWidgetSettings(widgetId: string, settings: WidgetSettings): any {
  return settings[widgetId];
}

/**
 * Update settings for a specific widget
 * @param widgetId Widget ID
 * @param newSettings New settings for the widget
 * @param currentSettings Current all widget settings
 * @returns Updated settings object
 */
export function updateWidgetSettings(
  widgetId: string,
  newSettings: any,
  currentSettings: WidgetSettings
): WidgetSettings {
  const config = WIDGET_REGISTRY.get(widgetId);
  if (!config || !config.settingsKey) {
    // Widget not found or does not support settings
    return currentSettings;
  }

  // Apply parser if available
  const processedSettings = config.parser ? config.parser(newSettings) : newSettings;

  // Apply validator if available
  if (config.validator && !config.validator(processedSettings)) {
    console.error(`Invalid settings for widget ${widgetId}:`, processedSettings);
    return currentSettings;
  }

  return {
    ...currentSettings,
    [widgetId]: processedSettings,
  };
}