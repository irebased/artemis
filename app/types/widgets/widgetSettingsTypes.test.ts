import {
  FrequencyAnalysisSettings,
  AsciiDistributionSettings,
  IndexOfCoincidenceSettings,
  ShannonEntropySettings,
  ChiSquaredSettings,
  KolmogorovSmirnovSettings,
  WidgetSettingsTypes,
  SettingsTypeForKey,
} from './widgetSettingsTypes';

describe('WidgetSettingsTypes', () => {
  describe('Type exports', () => {
    it('should export all widget settings types', () => {
      // These should compile without errors
      const freqSettings: FrequencyAnalysisSettings = {
        ngramSize: 2,
        ngramMode: 'sliding',
      };

      const asciiSettings: AsciiDistributionSettings = {
        range: 'extended',
      };

      const icSettings: IndexOfCoincidenceSettings = {
        mode: 'summary',
        ngramSize: 2,
        ngramMode: 'sliding',
        showAverageLines: true,
      };

      const entropySettings: ShannonEntropySettings = {
        mode: 'raw',
        windowSize: 64,
      };

      const chiSquaredSettings: ChiSquaredSettings = {
        selectedTextIndex: 0,
        baseDataIndex: 'sample',
      };

      const ksSettings: KolmogorovSmirnovSettings = {
        ngramSize: 2,
        ngramMode: 'sliding',
      };

      expect(freqSettings.ngramSize).toBe(2);
      expect(asciiSettings.range).toBe('extended');
      expect(icSettings.mode).toBe('summary');
      expect(entropySettings.mode).toBe('raw');
      expect(chiSquaredSettings.selectedTextIndex).toBe(0);
      expect(ksSettings.ngramSize).toBe(2);
    });
  });

  describe('WidgetSettingsTypes interface', () => {
    it('should have correct type mappings', () => {
      // Test that the interface correctly maps settings keys to their types
      const settings: WidgetSettingsTypes = {
        frequencyAnalysisSettings: {
          ngramSize: 2,
          ngramMode: 'sliding',
        },
        asciiDistributionSettings: {
          range: 'extended',
        },
        indexOfCoincidenceSettings: {
          mode: 'summary',
          ngramSize: 2,
          ngramMode: 'sliding',
          showAverageLines: true,
        },
        shannonEntropySettings: {
          mode: 'raw',
          windowSize: 64,
        },
        chiSquaredSettings: {
          selectedTextIndex: 0,
          baseDataIndex: 'sample',
        },
        kolmogorovSmirnovSettings: {
          ngramSize: 2,
          ngramMode: 'sliding',
        },
      };

      expect(settings.frequencyAnalysisSettings.ngramSize).toBe(2);
      expect(settings.asciiDistributionSettings.range).toBe('extended');
      expect(settings.indexOfCoincidenceSettings.mode).toBe('summary');
      expect(settings.shannonEntropySettings.mode).toBe('raw');
      expect(settings.chiSquaredSettings.selectedTextIndex).toBe(0);
      expect(settings.kolmogorovSmirnovSettings.ngramSize).toBe(2);
    });
  });

  describe('SettingsTypeForKey helper', () => {
    it('should correctly infer types from keys', () => {
      // Test that the helper type works correctly
      type FreqType = SettingsTypeForKey<'frequencyAnalysisSettings'>;
      type AsciiType = SettingsTypeForKey<'asciiDistributionSettings'>;
      type ICType = SettingsTypeForKey<'indexOfCoincidenceSettings'>;
      type EntropyType = SettingsTypeForKey<'shannonEntropySettings'>;
      type ChiSquaredType = SettingsTypeForKey<'chiSquaredSettings'>;
      type KSType = SettingsTypeForKey<'kolmogorovSmirnovSettings'>;

      // These should compile without errors
      const freqSettings: FreqType = {
        ngramSize: 2,
        ngramMode: 'sliding',
      };

      const asciiSettings: AsciiType = {
        range: 'extended',
      };

      const icSettings: ICType = {
        mode: 'summary',
        ngramSize: 2,
        ngramMode: 'sliding',
        showAverageLines: true,
      };

      const entropySettings: EntropyType = {
        mode: 'raw',
        windowSize: 64,
      };

      const chiSquaredSettings: ChiSquaredType = {
        selectedTextIndex: 0,
        baseDataIndex: 'sample',
      };

      const ksSettings: KSType = {
        ngramSize: 2,
        ngramMode: 'sliding',
      };

      expect(freqSettings.ngramSize).toBe(2);
      expect(asciiSettings.range).toBe('extended');
      expect(icSettings.mode).toBe('summary');
      expect(entropySettings.mode).toBe('raw');
      expect(chiSquaredSettings.selectedTextIndex).toBe(0);
      expect(ksSettings.ngramSize).toBe(2);
    });
  });
});