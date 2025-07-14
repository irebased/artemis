import fs from 'fs';
import path from 'path';

/**
 * Auto-discovery utility for finding widget folders
 * This can be used during build time to generate the widget list
 */

export interface WidgetDiscoveryResult {
  folderName: string;
  hasConfig: boolean;
  configPath: string;
}

/**
 * Discover all widget folders in the widgets directory
 * @param widgetsDir Path to the widgets directory
 * @returns Array of discovered widget folders
 */
export function discoverWidgetFolders(widgetsDir: string = './components/widgets'): WidgetDiscoveryResult[] {
  const results: WidgetDiscoveryResult[] = [];

  try {
    const items = fs.readdirSync(widgetsDir);

    for (const item of items) {
      const itemPath = path.join(widgetsDir, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory() && item.endsWith('Widget')) {
        const configPath = path.join(itemPath, 'widgetConfig.ts');
        const hasConfig = fs.existsSync(configPath);

        results.push({
          folderName: item,
          hasConfig,
          configPath: hasConfig ? configPath : '',
        });
      }
    }
  } catch (error) {
    console.error('Error discovering widget folders:', error);
  }

  return results;
}

/**
 * Generate the widget folders array for the registry
 * @returns Array of widget folder names
 */
export function generateWidgetFoldersList(): string[] {
  const discovered = discoverWidgetFolders();
  return discovered
    .filter(result => result.hasConfig)
    .map(result => result.folderName);
}

/**
 * Validate that all widget folders have proper configs
 * @returns Array of validation errors
 */
export function validateWidgetConfigs(): string[] {
  const discovered = discoverWidgetFolders();
  const errors: string[] = [];

  discovered.forEach(result => {
    if (result.folderName.endsWith('Widget') && !result.hasConfig) {
      errors.push(`Widget folder '${result.folderName}' is missing widgetConfig.ts`);
    }
  });

  return errors;
}

// Export for use in build scripts or other utilities
export { discoverWidgetFolders as default };