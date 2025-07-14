import { decompressFromEncodedURIComponent } from 'lz-string';
import { decompressLZMA } from '@/utils/compression/compressionUtils';
import { decompressSettings } from '@/utils/settings/settingsUtils';
import { Ciphertext } from '@/types/ciphertext';
import { AsciiRange } from '@/types/dashboard/dashboardTypes';

export interface ParsedUrlParameters {
  inputs?: Ciphertext[];
  widgets?: string[];
  dashboardName?: string;
  entropyMode?: 'raw' | 'sliding';
  entropyWindow?: number;
  layouts?: any;
  ignorePunctuation?: boolean;
  ignoreWhitespace?: boolean;
  ignoreCasing?: boolean;
  asciiRange?: AsciiRange;
  layoutLocked?: boolean;
  frequencyAnalysisSettings?: any;
  shannonEntropySettings?: any;
  asciiDistributionSettings?: any;
  indexOfCoincidenceSettings?: any;
  kolmogorovSmirnovSettings?: any;
  chiSquaredSettings?: any;
}

export interface LoadingState {
  loadedInputs: boolean;
  loadedLayouts: boolean;
  asyncLoads: number;
}

/**
 * Parse and validate entropy mode parameter
 * @param modeParam Raw mode parameter from URL
 * @returns Validated entropy mode or undefined
 */
export function parseEntropyMode(modeParam: string | null): 'raw' | 'sliding' | undefined {
  if (modeParam === 'sliding' || modeParam === 'raw') {
    return modeParam;
  }
  return undefined;
}

/**
 * Parse and validate entropy window parameter
 * @param windowParam Raw window parameter from URL
 * @returns Validated window size or undefined
 */
export function parseEntropyWindow(windowParam: string | null): number | undefined {
  if (windowParam && !isNaN(parseInt(windowParam))) {
    return parseInt(windowParam);
  }
  return undefined;
}

/**
 * Parse and validate ASCII range parameter
 * @param asciiRangeParam Raw ASCII range parameter from URL
 * @returns Validated ASCII range or undefined
 */
export function parseAsciiRange(asciiRangeParam: string | null): AsciiRange | undefined {
  if (asciiRangeParam === 'extended' || asciiRangeParam === 'ascii' || asciiRangeParam === 'input') {
    return asciiRangeParam;
  }
  return undefined;
}

/**
 * Parse and validate layout lock parameter
 * @param lockParam Raw lock parameter from URL
 * @returns Boolean indicating if layout is locked
 */
export function parseLayoutLock(lockParam: string | null): boolean {
  return lockParam === '1' || lockParam === 'true';
}

/**
 * Parse and validate boolean parameter
 * @param param Raw boolean parameter from URL
 * @returns Boolean value or undefined
 */
export function parseBooleanParam(param: string | null): boolean | undefined {
  if (param !== null) {
    return param === 'true';
  }
  return undefined;
}

/**
 * Parse widgets parameter
 * @param widgetParam Raw widgets parameter from URL
 * @param widgetDefaults Available widget defaults for validation
 * @returns Array of valid widget names
 */
export function parseWidgets(widgetParam: string | null, widgetDefaults: Record<string, any>): string[] {
  if (widgetParam) {
    return widgetParam
      .split(',')
      .filter((w) => w in widgetDefaults) as string[];
  }
  return [];
}

/**
 * Parse dashboard name parameter
 * @param nameParam Raw name parameter from URL
 * @returns Decoded dashboard name or undefined
 */
export function parseDashboardName(nameParam: string | null): string | undefined {
  if (nameParam) {
    return decodeURIComponent(nameParam);
  }
  return undefined;
}

/**
 * Parse compressed inputs from lzdata parameter
 * @param lzdataParam Raw lzdata parameter from URL
 * @returns Promise that resolves to parsed inputs or undefined
 */
export async function parseCompressedInputs(lzdataParam: string | null): Promise<Ciphertext[] | undefined> {
  if (!lzdataParam) {
    return undefined;
  }

  try {
    const json = await decompressLZMA(lzdataParam);
    const decoded = JSON.parse(json as string);
    if (Array.isArray(decoded)) {
      return decoded;
    }
  } catch (e) {
    // Return undefined on error
  }
  return undefined;
}

/**
 * Parse compressed layouts from lzdata_layout parameter
 * @param lzlayoutParam Raw lzdata_layout parameter from URL
 * @returns Promise that resolves to parsed layouts or undefined
 */
export async function parseCompressedLayouts(lzlayoutParam: string | null): Promise<any | undefined> {
  if (!lzlayoutParam) {
    return undefined;
  }

  try {
    const json = await decompressLZMA(lzlayoutParam);
    const decoded = JSON.parse(json as string);
    return decoded;
  } catch (e) {
    // Return undefined on error
  }
  return undefined;
}

/**
 * Parse legacy layout parameter
 * @param layoutParam Raw layout parameter from URL
 * @returns Parsed layouts or undefined
 */
export function parseLegacyLayout(layoutParam: string | null): any | undefined {
  if (!layoutParam) {
    return undefined;
  }

  try {
    const decoded = JSON.parse(decompressFromEncodedURIComponent(layoutParam));
    return decoded;
  } catch (e) {
    // Return undefined on error
  }
  return undefined;
}

/**
 * Parse compressed settings parameter
 * @param settingsParam Raw settings parameter from URL
 * @returns Parsed settings or undefined
 */
export function parseCompressedSettings(settingsParam: string | null): any | undefined {
  if (!settingsParam) {
    return undefined;
  }

  try {
    return decompressSettings(settingsParam);
  } catch (e) {
    // Return undefined on error
  }
  return undefined;
}

/**
 * Parse all URL parameters at once
 * @param query URLSearchParams object
 * @param widgetDefaults Available widget defaults for validation
 * @returns Promise that resolves to all parsed parameters
 */
export async function parseAllUrlParameters(
  query: URLSearchParams,
  widgetDefaults: Record<string, any>
): Promise<ParsedUrlParameters> {
  const lzdataParam = query.get('lzdata');
  const lzlayoutParam = query.get('lzdata_layout');

  // Parse async parameters
  const [inputs, layouts] = await Promise.all([
    parseCompressedInputs(lzdataParam),
    parseCompressedLayouts(lzlayoutParam),
  ]);

  // Parse sync parameters
  const widgetParam = query.get('widgets');
  const modeParam = query.get('entropyMode');
  const windowParam = query.get('entropyWindow');
  const layoutParam = query.get('layout');
  const ignorePunctParam = query.get('ignorePunctuation');
  const ignoreWSParam = query.get('ignoreWhitespace');
  const ignoreCaseParam = query.get('ignoreCasing');
  const asciiRangeParam = query.get('asciiRange');
  const lockParam = query.get('lock');
  const freqSettingsParam = query.get('freqSettings');
  const entropySettingsParam = query.get('entropySettings');
  const asciiSettingsParam = query.get('asciiSettings');
  const icSettingsParam = query.get('icSettings');
  const ksSettingsParam = query.get('ksSettings');
  const chiSquaredSettingsParam = query.get('chiSquaredSettings');
  const nameParam = query.get('name');

  return {
    inputs,
    layouts: layouts || parseLegacyLayout(layoutParam),
    widgets: parseWidgets(widgetParam, widgetDefaults),
    dashboardName: parseDashboardName(nameParam),
    entropyMode: parseEntropyMode(modeParam),
    entropyWindow: parseEntropyWindow(windowParam),
    ignorePunctuation: parseBooleanParam(ignorePunctParam),
    ignoreWhitespace: parseBooleanParam(ignoreWSParam),
    ignoreCasing: parseBooleanParam(ignoreCaseParam),
    asciiRange: parseAsciiRange(asciiRangeParam),
    layoutLocked: parseLayoutLock(lockParam),
    frequencyAnalysisSettings: parseCompressedSettings(freqSettingsParam),
    shannonEntropySettings: parseCompressedSettings(entropySettingsParam),
    asciiDistributionSettings: parseCompressedSettings(asciiSettingsParam),
    indexOfCoincidenceSettings: parseCompressedSettings(icSettingsParam),
    kolmogorovSmirnovSettings: parseCompressedSettings(ksSettingsParam),
    chiSquaredSettings: parseCompressedSettings(chiSquaredSettingsParam),
  };
}

/**
 * Check if loading is complete based on parameters and loading state
 * @param lzdataParam Whether lzdata parameter exists
 * @param loadingState Current loading state
 * @returns Boolean indicating if loading is complete
 */
export function isLoadingComplete(lzdataParam: string | null, loadingState: LoadingState): boolean {
  return (lzdataParam ? loadingState.loadedInputs : true) && loadingState.loadedLayouts;
}