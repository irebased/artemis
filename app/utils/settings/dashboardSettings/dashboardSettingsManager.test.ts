import {
  DEFAULT_FREQUENCY_ANALYSIS_SETTINGS,
  DEFAULT_SHANNON_ENTROPY_SETTINGS,
  DEFAULT_ASCII_DISTRIBUTION_SETTINGS,
  DEFAULT_INDEX_OF_COINCIDENCE_SETTINGS,
  DEFAULT_KOLMOGOROV_SMIRNOV_SETTINGS,
  DEFAULT_CHI_SQUARED_SETTINGS,
  validateFrequencyAnalysisSettings,
  validateShannonEntropySettings,
  validateAsciiDistributionSettings,
  validateIndexOfCoincidenceSettings,
  validateKolmogorovSmirnovSettings,
  validateChiSquaredSettings,
  getDefaultSettings,
  validateAllSettings,
} from './dashboardSettingsManager';

describe('dashboardSettingsManager', () => {
  describe('Default Settings', () => {
    it('should have correct default frequency analysis settings', () => {
      expect(DEFAULT_FREQUENCY_ANALYSIS_SETTINGS).toEqual({
        ngramSize: 1,
        ngramMode: 'sliding',
        showTableView: false,
        sortByInput: undefined,
        sortDirection: undefined,
      });
    });

    it('should have correct default Shannon entropy settings', () => {
      expect(DEFAULT_SHANNON_ENTROPY_SETTINGS).toEqual({
        mode: 'raw',
        windowSize: 64,
      });
    });

    it('should have correct default ASCII distribution settings', () => {
      expect(DEFAULT_ASCII_DISTRIBUTION_SETTINGS).toEqual({
        range: 'extended',
      });
    });

    it('should have correct default Index of Coincidence settings', () => {
      expect(DEFAULT_INDEX_OF_COINCIDENCE_SETTINGS).toEqual({
        mode: 'summary',
        ngramSize: 1,
        ngramMode: 'sliding',
      });
    });

    it('should have correct default Kolmogorov-Smirnov settings', () => {
      expect(DEFAULT_KOLMOGOROV_SMIRNOV_SETTINGS).toEqual({
        ngramSize: 1,
        ngramMode: 'sliding',
      });
    });

    it('should have correct default Chi-Squared settings', () => {
      expect(DEFAULT_CHI_SQUARED_SETTINGS).toEqual({
        selectedTextIndex: 0,
        baseDataIndex: 'sample',
      });
    });
  });

  describe('validateFrequencyAnalysisSettings', () => {
    it('should return valid settings unchanged', () => {
      const validSettings = {
        ngramSize: 2,
        ngramMode: 'block' as const,
        showTableView: true,
        sortByInput: 1,
        sortDirection: 'desc' as const,
      };

      const result = validateFrequencyAnalysisSettings(validSettings);

      expect(result).toEqual(validSettings);
    });

    it('should use defaults for invalid ngramSize', () => {
      const invalidSettings = {
        ngramSize: -1,
        ngramMode: 'sliding' as const,
      };

      const result = validateFrequencyAnalysisSettings(invalidSettings);

      expect(result.ngramSize).toBe(DEFAULT_FREQUENCY_ANALYSIS_SETTINGS.ngramSize);
      expect(result.ngramMode).toBe('sliding');
    });

    it('should use defaults for invalid ngramMode', () => {
      const invalidSettings = {
        ngramSize: 1,
        ngramMode: 'invalid' as any,
      };

      const result = validateFrequencyAnalysisSettings(invalidSettings);

      expect(result.ngramSize).toBe(1);
      expect(result.ngramMode).toBe(DEFAULT_FREQUENCY_ANALYSIS_SETTINGS.ngramMode);
    });

    it('should handle partial settings', () => {
      const partialSettings = {
        ngramSize: 3,
      };

      const result = validateFrequencyAnalysisSettings(partialSettings);

      expect(result.ngramSize).toBe(3);
      expect(result.ngramMode).toBe(DEFAULT_FREQUENCY_ANALYSIS_SETTINGS.ngramMode);
    });

    it('should handle empty settings', () => {
      const result = validateFrequencyAnalysisSettings({});

      expect(result).toEqual(DEFAULT_FREQUENCY_ANALYSIS_SETTINGS);
    });

    it('should use defaults for invalid showTableView', () => {
      const invalidSettings = {
        ngramSize: 1,
        ngramMode: 'sliding' as const,
        showTableView: 'invalid' as any,
      };

      const result = validateFrequencyAnalysisSettings(invalidSettings);

      expect(result.ngramSize).toBe(1);
      expect(result.ngramMode).toBe('sliding');
      expect(result.showTableView).toBe(DEFAULT_FREQUENCY_ANALYSIS_SETTINGS.showTableView);
    });

    it('should use defaults for invalid sortByInput', () => {
      const invalidSettings = {
        ngramSize: 1,
        ngramMode: 'sliding' as const,
        sortByInput: 'invalid' as any,
      };

      const result = validateFrequencyAnalysisSettings(invalidSettings);

      expect(result.ngramSize).toBe(1);
      expect(result.ngramMode).toBe('sliding');
      expect(result.sortByInput).toBe(DEFAULT_FREQUENCY_ANALYSIS_SETTINGS.sortByInput);
    });

    it('should use defaults for invalid sortDirection', () => {
      const invalidSettings = {
        ngramSize: 1,
        ngramMode: 'sliding' as const,
        sortDirection: 'invalid' as any,
      };

      const result = validateFrequencyAnalysisSettings(invalidSettings);

      expect(result.ngramSize).toBe(1);
      expect(result.ngramMode).toBe('sliding');
      expect(result.sortDirection).toBe(DEFAULT_FREQUENCY_ANALYSIS_SETTINGS.sortDirection);
    });
  });

  describe('validateShannonEntropySettings', () => {
    it('should return valid settings unchanged', () => {
      const validSettings = {
        mode: 'sliding' as const,
        windowSize: 128 as const,
      };

      const result = validateShannonEntropySettings(validSettings);

      expect(result).toEqual(validSettings);
    });

    it('should use defaults for invalid mode', () => {
      const invalidSettings = {
        mode: 'invalid' as any,
        windowSize: 64 as const,
      };

      const result = validateShannonEntropySettings(invalidSettings);

      expect(result.mode).toBe(DEFAULT_SHANNON_ENTROPY_SETTINGS.mode);
      expect(result.windowSize).toBe(64);
    });

    it('should use defaults for invalid windowSize', () => {
      const invalidSettings = {
        mode: 'raw' as const,
        windowSize: 100 as any, // not in valid sizes
      };

      const result = validateShannonEntropySettings(invalidSettings);

      expect(result.mode).toBe('raw');
      expect(result.windowSize).toBe(DEFAULT_SHANNON_ENTROPY_SETTINGS.windowSize);
    });

    it('should accept all valid window sizes', () => {
      const validSizes = [16, 32, 64, 128, 256] as const;

      validSizes.forEach(size => {
        const settings = {
          mode: 'raw' as const,
          windowSize: size,
        };

        const result = validateShannonEntropySettings(settings);

        expect(result.windowSize).toBe(size);
      });
    });

    it('should handle partial settings', () => {
      const partialSettings = {
        mode: 'sliding' as const,
      };

      const result = validateShannonEntropySettings(partialSettings);

      expect(result.mode).toBe('sliding');
      expect(result.windowSize).toBe(DEFAULT_SHANNON_ENTROPY_SETTINGS.windowSize);
    });
  });

  describe('validateAsciiDistributionSettings', () => {
    it('should return valid settings unchanged', () => {
      const validSettings = {
        range: 'ascii' as const,
      };

      const result = validateAsciiDistributionSettings(validSettings);

      expect(result).toEqual(validSettings);
    });

    it('should use defaults for invalid range', () => {
      const invalidSettings = {
        range: 'invalid' as any,
      };

      const result = validateAsciiDistributionSettings(invalidSettings);

      expect(result.range).toBe(DEFAULT_ASCII_DISTRIBUTION_SETTINGS.range);
    });

    it('should accept all valid range values', () => {
      const validRanges = ['extended', 'ascii', 'input'] as const;

      validRanges.forEach(range => {
        const settings = { range };

        const result = validateAsciiDistributionSettings(settings);

        expect(result.range).toBe(range);
      });
    });

    it('should handle empty settings', () => {
      const result = validateAsciiDistributionSettings({});

      expect(result).toEqual(DEFAULT_ASCII_DISTRIBUTION_SETTINGS);
    });
  });

  describe('validateIndexOfCoincidenceSettings', () => {
    it('should return valid settings unchanged', () => {
      const validSettings = {
        mode: 'period' as const,
        ngramSize: 2,
        ngramMode: 'block' as const,
      };

      const result = validateIndexOfCoincidenceSettings(validSettings);

      expect(result).toEqual(validSettings);
    });

    it('should use defaults for invalid mode', () => {
      const invalidSettings = {
        mode: 'invalid' as any,
        ngramSize: 1,
        ngramMode: 'sliding' as const,
      };

      const result = validateIndexOfCoincidenceSettings(invalidSettings);

      expect(result.mode).toBe(DEFAULT_INDEX_OF_COINCIDENCE_SETTINGS.mode);
    });

    it('should use defaults for invalid ngramSize', () => {
      const invalidSettings = {
        mode: 'summary' as const,
        ngramSize: 0,
        ngramMode: 'sliding' as const,
      };

      const result = validateIndexOfCoincidenceSettings(invalidSettings);

      expect(result.ngramSize).toBe(DEFAULT_INDEX_OF_COINCIDENCE_SETTINGS.ngramSize);
    });

    it('should use defaults for invalid ngramMode', () => {
      const invalidSettings = {
        mode: 'summary' as const,
        ngramSize: 1,
        ngramMode: 'invalid' as any,
      };

      const result = validateIndexOfCoincidenceSettings(invalidSettings);

      expect(result.ngramMode).toBe(DEFAULT_INDEX_OF_COINCIDENCE_SETTINGS.ngramMode);
    });

    it('should handle partial settings', () => {
      const partialSettings = {
        mode: 'period' as const,
      };

      const result = validateIndexOfCoincidenceSettings(partialSettings);

      expect(result.mode).toBe('period');
      expect(result.ngramSize).toBe(DEFAULT_INDEX_OF_COINCIDENCE_SETTINGS.ngramSize);
      expect(result.ngramMode).toBe(DEFAULT_INDEX_OF_COINCIDENCE_SETTINGS.ngramMode);
    });
  });

  describe('validateKolmogorovSmirnovSettings', () => {
    it('should return valid settings unchanged', () => {
      const validSettings = {
        ngramSize: 3,
        ngramMode: 'block' as const,
      };

      const result = validateKolmogorovSmirnovSettings(validSettings);

      expect(result).toEqual(validSettings);
    });

    it('should use defaults for invalid ngramSize', () => {
      const invalidSettings = {
        ngramSize: 0,
        ngramMode: 'sliding' as const,
      };

      const result = validateKolmogorovSmirnovSettings(invalidSettings);

      expect(result.ngramSize).toBe(DEFAULT_KOLMOGOROV_SMIRNOV_SETTINGS.ngramSize);
    });

    it('should use defaults for invalid ngramMode', () => {
      const invalidSettings = {
        ngramSize: 1,
        ngramMode: 'invalid' as any,
      };

      const result = validateKolmogorovSmirnovSettings(invalidSettings);

      expect(result.ngramMode).toBe(DEFAULT_KOLMOGOROV_SMIRNOV_SETTINGS.ngramMode);
    });

    it('should handle partial settings', () => {
      const partialSettings = {
        ngramSize: 2,
      };

      const result = validateKolmogorovSmirnovSettings(partialSettings);

      expect(result.ngramSize).toBe(2);
      expect(result.ngramMode).toBe(DEFAULT_KOLMOGOROV_SMIRNOV_SETTINGS.ngramMode);
    });
  });

  describe('validateChiSquaredSettings', () => {
    it('should return valid settings unchanged', () => {
      const validSettings = {
        selectedTextIndex: 1,
        baseDataIndex: 2,
      };

      const result = validateChiSquaredSettings(validSettings);

      expect(result).toEqual(validSettings);
    });

    it('should accept string baseDataIndex', () => {
      const validSettings = {
        selectedTextIndex: 0,
        baseDataIndex: 'sample' as const,
      };

      const result = validateChiSquaredSettings(validSettings);

      expect(result).toEqual(validSettings);
    });

    it('should use defaults for invalid selectedTextIndex', () => {
      const invalidSettings = {
        selectedTextIndex: -1,
        baseDataIndex: 'sample' as const,
      };

      const result = validateChiSquaredSettings(invalidSettings);

      expect(result.selectedTextIndex).toBe(DEFAULT_CHI_SQUARED_SETTINGS.selectedTextIndex);
    });

    it('should use defaults for invalid baseDataIndex', () => {
      const invalidSettings = {
        selectedTextIndex: 0,
        baseDataIndex: 'invalid' as any,
      };

      const result = validateChiSquaredSettings(invalidSettings);

      expect(result.baseDataIndex).toBe(DEFAULT_CHI_SQUARED_SETTINGS.baseDataIndex);
    });

    it('should handle partial settings', () => {
      const partialSettings = {
        selectedTextIndex: 3,
      };

      const result = validateChiSquaredSettings(partialSettings);

      expect(result.selectedTextIndex).toBe(3);
      expect(result.baseDataIndex).toBe(DEFAULT_CHI_SQUARED_SETTINGS.baseDataIndex);
    });
  });

  describe('getDefaultSettings', () => {
    it('should return all default settings', () => {
      const result = getDefaultSettings();

      expect(result).toEqual({
        frequencyAnalysis: DEFAULT_FREQUENCY_ANALYSIS_SETTINGS,
        shannonEntropy: DEFAULT_SHANNON_ENTROPY_SETTINGS,
        asciiDistribution: DEFAULT_ASCII_DISTRIBUTION_SETTINGS,
        indexOfCoincidence: DEFAULT_INDEX_OF_COINCIDENCE_SETTINGS,
        kolmogorovSmirnov: DEFAULT_KOLMOGOROV_SMIRNOV_SETTINGS,
        chiSquared: DEFAULT_CHI_SQUARED_SETTINGS,
      });
    });
  });

  describe('validateAllSettings', () => {
    it('should validate all settings at once', () => {
      const settings = {
        frequencyAnalysis: { ngramSize: 2 },
        shannonEntropy: { mode: 'sliding' as const },
        asciiDistribution: { range: 'ascii' as const },
        indexOfCoincidence: { mode: 'period' as const },
        kolmogorovSmirnov: { ngramSize: 3 },
        chiSquared: { selectedTextIndex: 1 },
      };

      const result = validateAllSettings(settings);

      expect(result.frequencyAnalysis.ngramSize).toBe(2);
      expect(result.frequencyAnalysis.ngramMode).toBe(DEFAULT_FREQUENCY_ANALYSIS_SETTINGS.ngramMode);
      expect(result.shannonEntropy.mode).toBe('sliding');
      expect(result.shannonEntropy.windowSize).toBe(DEFAULT_SHANNON_ENTROPY_SETTINGS.windowSize);
      expect(result.asciiDistribution.range).toBe('ascii');
      expect(result.indexOfCoincidence.mode).toBe('period');
      expect(result.kolmogorovSmirnov.ngramSize).toBe(3);
      expect(result.chiSquared.selectedTextIndex).toBe(1);
    });

    it('should handle partial settings object', () => {
      const settings = {
        frequencyAnalysis: { ngramSize: 2 },
        // other settings omitted
      };

      const result = validateAllSettings(settings);

      expect(result.frequencyAnalysis.ngramSize).toBe(2);
      expect(result.shannonEntropy).toEqual(DEFAULT_SHANNON_ENTROPY_SETTINGS);
      expect(result.asciiDistribution).toEqual(DEFAULT_ASCII_DISTRIBUTION_SETTINGS);
      expect(result.indexOfCoincidence).toEqual(DEFAULT_INDEX_OF_COINCIDENCE_SETTINGS);
      expect(result.kolmogorovSmirnov).toEqual(DEFAULT_KOLMOGOROV_SMIRNOV_SETTINGS);
      expect(result.chiSquared).toEqual(DEFAULT_CHI_SQUARED_SETTINGS);
    });

    it('should handle empty settings object', () => {
      const result = validateAllSettings({});

      expect(result.frequencyAnalysis).toEqual(DEFAULT_FREQUENCY_ANALYSIS_SETTINGS);
      expect(result.shannonEntropy).toEqual(DEFAULT_SHANNON_ENTROPY_SETTINGS);
      expect(result.asciiDistribution).toEqual(DEFAULT_ASCII_DISTRIBUTION_SETTINGS);
      expect(result.indexOfCoincidence).toEqual(DEFAULT_INDEX_OF_COINCIDENCE_SETTINGS);
      expect(result.kolmogorovSmirnov).toEqual(DEFAULT_KOLMOGOROV_SMIRNOV_SETTINGS);
      expect(result.chiSquared).toEqual(DEFAULT_CHI_SQUARED_SETTINGS);
    });
  });
});