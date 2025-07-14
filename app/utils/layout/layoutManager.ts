import { Ciphertext } from '@/types/ciphertext';
import { AsciiRange } from '@/types/dashboard/dashboardTypes';
import { BaseType } from '@/types/bases';

export interface LayoutState {
  lg: any[];
  md: any[];
  sm: any[];
}

export interface LayoutConfig {
  COLS: {
    lg: number;
    md: number;
    sm: number;
  };
  generateLayout: (widgets: string[], cols: number) => any[];
  mergeLayoutsWithWidgets: (layouts: LayoutState, widgets: string[]) => LayoutState;
}

export interface LayoutChangeParams {
  widgets: string[];
  inputs: Ciphertext[];
  asciiBase: BaseType;
  entropyMode: 'raw' | 'sliding';
  entropyWindow: number;
  icMode: 'summary' | 'period';
  layouts: LayoutState;
  asciiRange: AsciiRange;
}

/**
 * Initialize default layouts for all screen sizes
 * @param widgets Array of widget names
 * @param config Layout configuration with COLS and generateLayout function
 * @returns Initialized layout state
 */
export function initializeLayouts(widgets: string[], config: LayoutConfig): LayoutState {
  return {
    lg: config.generateLayout(widgets, config.COLS.lg),
    md: config.generateLayout(widgets, config.COLS.md),
    sm: config.generateLayout(widgets, config.COLS.sm),
  };
}

/**
 * Update layouts when widgets change
 * @param widgets Array of widget names
 * @param currentLayouts Current layout state
 * @param config Layout configuration
 * @returns Updated layout state
 */
export function updateLayoutsForWidgets(
  widgets: string[],
  currentLayouts: LayoutState,
  config: LayoutConfig
): LayoutState {
  return config.mergeLayoutsWithWidgets(currentLayouts, widgets);
}

/**
 * Handle layout changes and return updated state
 * @param currentLayout Current layout being changed
 * @param allLayouts All layouts after the change
 * @param layoutParams Parameters needed for layout synchronization
 * @returns Updated layout state
 */
export function handleLayoutChange(
  currentLayout: any,
  allLayouts: LayoutState,
  layoutParams: LayoutChangeParams
): LayoutState {
  // The main logic here is to return the updated layouts
  // The actual URL synchronization is handled by the URL sync module
  return allLayouts;
}

/**
 * Check if layouts need to be regenerated based on widget changes
 * @param oldWidgets Previous widget array
 * @param newWidgets New widget array
 * @returns Boolean indicating if layouts should be regenerated
 */
export function shouldRegenerateLayouts(oldWidgets: string[], newWidgets: string[]): boolean {
  if (oldWidgets.length !== newWidgets.length) {
    return true;
  }

  // Check if any widgets have changed
  return oldWidgets.some((widget, index) => widget !== newWidgets[index]);
}

/**
 * Get layout for a specific screen size
 * @param layouts Layout state
 * @param screenSize Screen size ('lg', 'md', 'sm')
 * @returns Layout for the specified screen size
 */
export function getLayoutForScreenSize(layouts: LayoutState, screenSize: 'lg' | 'md' | 'sm'): any[] {
  return layouts[screenSize] || [];
}

/**
 * Check if layouts are empty
 * @param layouts Layout state
 * @returns Boolean indicating if all layouts are empty
 */
export function areLayoutsEmpty(layouts: LayoutState): boolean {
  return layouts.lg.length === 0 && layouts.md.length === 0 && layouts.sm.length === 0;
}

/**
 * Get the total number of widgets across all layouts
 * @param layouts Layout state
 * @returns Total number of widgets
 */
export function getTotalWidgetCount(layouts: LayoutState): number {
  return layouts.lg.length + layouts.md.length + layouts.sm.length;
}

/**
 * Validate layout structure
 * @param layouts Layout state to validate
 * @returns Boolean indicating if layout structure is valid
 */
export function validateLayoutStructure(layouts: LayoutState): boolean {
  return !!(
    layouts &&
    typeof layouts === 'object' &&
    Array.isArray(layouts.lg) &&
    Array.isArray(layouts.md) &&
    Array.isArray(layouts.sm)
  );
}