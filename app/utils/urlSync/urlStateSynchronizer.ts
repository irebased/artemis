import { compressLZMA } from '@/utils/compression/compressionUtils';
import { compressSettings } from '@/utils/settings/settingsUtils';
import { compressToEncodedURIComponent } from 'lz-string';
import { Ciphertext } from '@/types/ciphertext';
import {
  FrequencyAnalysisSettings,
  ShannonEntropySettings,
  AsciiDistributionSettings,
  IndexOfCoincidenceSettings,
  KolmogorovSmirnovSettings,
  ChiSquaredSettings,
  AsciiRange
} from '@/types/dashboard/dashboardTypes';
import { BaseType } from '@/types/bases';

export interface DashboardState {
  inputs: Ciphertext[];
  inputsForUrlSync?: Ciphertext[] | null;
  widgets: string[];
  layouts: any;
  asciiDistributionSettings: AsciiDistributionSettings;
  indexOfCoincidenceSettings: IndexOfCoincidenceSettings;
  loading: boolean;
  layoutLocked: boolean;
  frequencyAnalysisSettings: FrequencyAnalysisSettings;
  shannonEntropySettings: ShannonEntropySettings;
  kolmogorovSmirnovSettings: KolmogorovSmirnovSettings;
  chiSquaredSettings: ChiSquaredSettings;
  dashboardName: string;
}

export interface LegacyState {
  widgets: string[];
  inputs: Ciphertext[];
  asciiBase: BaseType;
  entropyMode: 'raw' | 'sliding';
  entropyWindow: number;
  icMode: 'summary' | 'period';
  layouts: any;
  asciiRange: AsciiRange;
}

/**
 * Build URL parameters for the main synchronization effect
 * @param state Current dashboard state
 * @returns Promise that resolves to URLSearchParams
 */
export async function buildUrlParameters(state: DashboardState): Promise<URLSearchParams> {
  const params = new URLSearchParams();

  // Use override if provided, else use internal state
  const urlInputs = state.inputsForUrlSync || state.inputs;

  // Compress inputs
  const compressedInputs = await compressLZMA(JSON.stringify(urlInputs));

  // Add basic parameters
  if (state.widgets.length > 0) {
    params.set('widgets', state.widgets.join(','));
  }
  if (state.layoutLocked) {
    params.set('lock', '1');
  }

  // Add settings parameters
  if (state.frequencyAnalysisSettings) {
    params.set('freqSettings', compressSettings(state.frequencyAnalysisSettings));
  }
  if (state.shannonEntropySettings) {
    params.set('entropySettings', compressSettings(state.shannonEntropySettings));
  }
  if (state.asciiDistributionSettings) {
    params.set('asciiSettings', compressSettings(state.asciiDistributionSettings));
  }
  if (state.indexOfCoincidenceSettings) {
    params.set('icSettings', compressSettings(state.indexOfCoincidenceSettings));
  }
  if (state.kolmogorovSmirnovSettings) {
    params.set('ksSettings', compressSettings(state.kolmogorovSmirnovSettings));
  }
  if (state.chiSquaredSettings) {
    params.set('chiSquaredSettings', compressSettings(state.chiSquaredSettings));
  }

  // Add dashboard name if not default
  if (state.dashboardName !== 'Artemis Dashboard') {
    params.set('name', encodeURIComponent(state.dashboardName));
  }

  // Add layouts and inputs if layouts exist
  if (state.layouts) {
    const compressedLayouts = await compressLZMA(JSON.stringify(state.layouts));
    params.set('lzdata_layout', compressedLayouts as string);
    params.set('lzdata', compressedInputs as string);
  }

  return params;
}

/**
 * Build legacy URL parameters for layout changes
 * @param state Current legacy state
 * @returns Promise that resolves to URLSearchParams and compressed data
 */
export async function buildLegacyUrlParameters(state: LegacyState): Promise<{
  params: URLSearchParams;
  compressedData: string;
}> {
  const params = new URLSearchParams();

  // Compress the main data object
  const paramsObj = {
    widgets: state.widgets,
    data: state.inputs.map(input => input.text),
    base: state.asciiBase,
    entropyMode: state.entropyMode,
    entropyWindow: state.entropyWindow,
    icMode: state.icMode,
    layout: state.layouts,
    ignorePunctuation: state.inputs.every(input => input.ignorePunctuation),
    ignoreWhitespace: state.inputs.every(input => input.ignoreWhitespace),
    ignoreCasing: state.inputs.every(input => input.ignoreCasing),
    asciiRange: state.asciiRange,
  };

  const compressedData = await compressLZMA(JSON.stringify(paramsObj));

  // Add basic parameters
  if (state.widgets.length > 0) {
    params.set('widgets', state.widgets.join(','));
  }
  if (state.inputs.length > 0) {
    params.set('data', state.inputs.map(input => compressToEncodedURIComponent(input.text)).join(','));
  }
  if (state.asciiBase) {
    params.set('base', state.asciiBase);
  }
  if (state.entropyMode) {
    params.set('entropyMode', state.entropyMode);
  }
  if (state.entropyMode === 'sliding') {
    params.set('entropyWindow', state.entropyWindow.toString());
  }
  if (state.icMode) {
    params.set('icMode', state.icMode);
  }

  // Add boolean parameters
  params.set('ignorePunctuation', String(state.inputs.every(input => input.ignorePunctuation)));
  params.set('ignoreWhitespace', String(state.inputs.every(input => input.ignoreWhitespace)));
  params.set('ignoreCasing', String(state.inputs.every(input => input.ignoreCasing)));
  params.set('asciiRange', state.asciiRange);

  return { params, compressedData: compressedData as string };
}

/**
 * Update the browser URL with new parameters
 * @param params URLSearchParams to set
 * @param compressedData Optional compressed data for legacy format
 */
export function updateBrowserUrl(params: URLSearchParams, compressedData?: string): void {
  let newUrl: string;

  if (compressedData) {
    const legacyQuery = params.toString();
    // Choose between compressed and legacy format based on length
    if (compressedData.length + 2 < legacyQuery.length) {
      newUrl = `${window.location.pathname}?lzdata=${compressedData}`;
    } else {
      newUrl = `${window.location.pathname}?${legacyQuery}`;
    }
  } else {
    newUrl = `${window.location.pathname}?${params.toString()}`;
  }

  window.history.replaceState(null, '', newUrl);
}

/**
 * Synchronize dashboard state to URL (main effect)
 * @param state Current dashboard state
 * @returns Promise that resolves when synchronization is complete
 */
export async function synchronizeDashboardState(state: DashboardState): Promise<void> {
  if (state.loading) return;

  const params = await buildUrlParameters(state);
  updateBrowserUrl(params);
}

/**
 * Synchronize layout changes to URL (legacy format)
 * @param state Current legacy state
 * @returns Promise that resolves when synchronization is complete
 */
export async function synchronizeLayoutChanges(state: LegacyState): Promise<void> {
  const { params, compressedData } = await buildLegacyUrlParameters(state);

  if (state.layouts) {
    // Add compressed layouts
    const compressedLayouts = await compressLZMA(JSON.stringify(state.layouts));
    params.set('lzdata_layout', compressedLayouts as string);
  }

  updateBrowserUrl(params, compressedData);
}

/**
 * Check if compressed format is more efficient than legacy format
 * @param compressedData Compressed data string
 * @param legacyQuery Legacy query string
 * @returns Boolean indicating if compressed format is shorter
 */
export function isCompressedFormatMoreEfficient(compressedData: string, legacyQuery: string): boolean {
  return compressedData.length + 2 < legacyQuery.length;
}