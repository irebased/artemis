import {
  FrequencyAnalysisSettings,
  ShannonEntropySettings,
  AsciiDistributionSettings,
  IndexOfCoincidenceSettings,
  KolmogorovSmirnovSettings,
  ChiSquaredSettings,
} from '@/types/dashboard/dashboardTypes';

/**
 * Default settings for Frequency Analysis widget
 */
export const DEFAULT_FREQUENCY_ANALYSIS_SETTINGS: FrequencyAnalysisSettings = {
  ngramSize: 1,
  ngramMode: 'sliding',
};

/**
 * Default settings for Shannon Entropy widget
 */
export const DEFAULT_SHANNON_ENTROPY_SETTINGS: ShannonEntropySettings = {
  mode: 'raw',
  windowSize: 64,
};

/**
 * Default settings for ASCII Distribution widget
 */
export const DEFAULT_ASCII_DISTRIBUTION_SETTINGS: AsciiDistributionSettings = {
  range: 'extended',
};

/**
 * Default settings for Index of Coincidence widget
 */
export const DEFAULT_INDEX_OF_COINCIDENCE_SETTINGS: IndexOfCoincidenceSettings = {
  mode: 'summary',
  ngramSize: 1,
  ngramMode: 'sliding',
};

/**
 * Default settings for Kolmogorov-Smirnov widget
 */
export const DEFAULT_KOLMOGOROV_SMIRNOV_SETTINGS: KolmogorovSmirnovSettings = {
  ngramSize: 1,
  ngramMode: 'sliding',
};

/**
 * Default settings for Chi-Squared widget
 */
export const DEFAULT_CHI_SQUARED_SETTINGS: ChiSquaredSettings = {
  selectedTextIndex: 0,
  baseDataIndex: 'sample',
};

/**
 * Validate frequency analysis settings
 * @param settings Settings to validate
 * @returns Validated settings or defaults
 */
export function validateFrequencyAnalysisSettings(
  settings: Partial<FrequencyAnalysisSettings>
): FrequencyAnalysisSettings {
  return {
    ngramSize: typeof settings.ngramSize === 'number' && settings.ngramSize > 0
      ? settings.ngramSize
      : DEFAULT_FREQUENCY_ANALYSIS_SETTINGS.ngramSize,
    ngramMode: settings.ngramMode === 'sliding' || settings.ngramMode === 'block'
      ? settings.ngramMode
      : DEFAULT_FREQUENCY_ANALYSIS_SETTINGS.ngramMode,
  };
}

/**
 * Validate Shannon entropy settings
 * @param settings Settings to validate
 * @returns Validated settings or defaults
 */
export function validateShannonEntropySettings(
  settings: Partial<ShannonEntropySettings>
): ShannonEntropySettings {
  const validWindowSizes = [16, 32, 64, 128, 256] as const;

  return {
    mode: settings.mode === 'raw' || settings.mode === 'sliding'
      ? settings.mode
      : DEFAULT_SHANNON_ENTROPY_SETTINGS.mode,
    windowSize: validWindowSizes.includes(settings.windowSize as any)
      ? settings.windowSize as 16 | 32 | 64 | 128 | 256
      : DEFAULT_SHANNON_ENTROPY_SETTINGS.windowSize,
  };
}

/**
 * Validate ASCII distribution settings
 * @param settings Settings to validate
 * @returns Validated settings or defaults
 */
export function validateAsciiDistributionSettings(
  settings: Partial<AsciiDistributionSettings>
): AsciiDistributionSettings {
  return {
    range: settings.range === 'extended' || settings.range === 'ascii' || settings.range === 'input'
      ? settings.range
      : DEFAULT_ASCII_DISTRIBUTION_SETTINGS.range,
  };
}

/**
 * Validate Index of Coincidence settings
 * @param settings Settings to validate
 * @returns Validated settings or defaults
 */
export function validateIndexOfCoincidenceSettings(
  settings: Partial<IndexOfCoincidenceSettings>
): IndexOfCoincidenceSettings {
  return {
    mode: settings.mode === 'summary' || settings.mode === 'period'
      ? settings.mode
      : DEFAULT_INDEX_OF_COINCIDENCE_SETTINGS.mode,
    ngramSize: typeof settings.ngramSize === 'number' && settings.ngramSize > 0
      ? settings.ngramSize
      : DEFAULT_INDEX_OF_COINCIDENCE_SETTINGS.ngramSize,
    ngramMode: settings.ngramMode === 'sliding' || settings.ngramMode === 'block'
      ? settings.ngramMode
      : DEFAULT_INDEX_OF_COINCIDENCE_SETTINGS.ngramMode,
  };
}

/**
 * Validate Kolmogorov-Smirnov settings
 * @param settings Settings to validate
 * @returns Validated settings or defaults
 */
export function validateKolmogorovSmirnovSettings(
  settings: Partial<KolmogorovSmirnovSettings>
): KolmogorovSmirnovSettings {
  return {
    ngramSize: typeof settings.ngramSize === 'number' && settings.ngramSize > 0
      ? settings.ngramSize
      : DEFAULT_KOLMOGOROV_SMIRNOV_SETTINGS.ngramSize,
    ngramMode: settings.ngramMode === 'sliding' || settings.ngramMode === 'block'
      ? settings.ngramMode
      : DEFAULT_KOLMOGOROV_SMIRNOV_SETTINGS.ngramMode,
  };
}

/**
 * Validate Chi-Squared settings
 * @param settings Settings to validate
 * @returns Validated settings or defaults
 */
export function validateChiSquaredSettings(
  settings: Partial<ChiSquaredSettings>
): ChiSquaredSettings {
  return {
    selectedTextIndex: typeof settings.selectedTextIndex === 'number' && settings.selectedTextIndex >= 0
      ? settings.selectedTextIndex
      : DEFAULT_CHI_SQUARED_SETTINGS.selectedTextIndex,
    baseDataIndex: typeof settings.baseDataIndex === 'number' || settings.baseDataIndex === 'sample'
      ? settings.baseDataIndex
      : DEFAULT_CHI_SQUARED_SETTINGS.baseDataIndex,
  };
}

/**
 * Get all default settings
 * @returns Object containing all default settings
 */
export function getDefaultSettings() {
  return {
    frequencyAnalysis: DEFAULT_FREQUENCY_ANALYSIS_SETTINGS,
    shannonEntropy: DEFAULT_SHANNON_ENTROPY_SETTINGS,
    asciiDistribution: DEFAULT_ASCII_DISTRIBUTION_SETTINGS,
    indexOfCoincidence: DEFAULT_INDEX_OF_COINCIDENCE_SETTINGS,
    kolmogorovSmirnov: DEFAULT_KOLMOGOROV_SMIRNOV_SETTINGS,
    chiSquared: DEFAULT_CHI_SQUARED_SETTINGS,
  };
}

/**
 * Validate all settings at once
 * @param settings Object containing all settings to validate
 * @returns Object containing all validated settings
 */
export function validateAllSettings(settings: {
  frequencyAnalysis?: Partial<FrequencyAnalysisSettings>;
  shannonEntropy?: Partial<ShannonEntropySettings>;
  asciiDistribution?: Partial<AsciiDistributionSettings>;
  indexOfCoincidence?: Partial<IndexOfCoincidenceSettings>;
  kolmogorovSmirnov?: Partial<KolmogorovSmirnovSettings>;
  chiSquared?: Partial<ChiSquaredSettings>;
}) {
  return {
    frequencyAnalysis: validateFrequencyAnalysisSettings(settings.frequencyAnalysis || {}),
    shannonEntropy: validateShannonEntropySettings(settings.shannonEntropy || {}),
    asciiDistribution: validateAsciiDistributionSettings(settings.asciiDistribution || {}),
    indexOfCoincidence: validateIndexOfCoincidenceSettings(settings.indexOfCoincidence || {}),
    kolmogorovSmirnov: validateKolmogorovSmirnovSettings(settings.kolmogorovSmirnov || {}),
    chiSquared: validateChiSquaredSettings(settings.chiSquared || {}),
  };
}