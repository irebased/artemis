import {
  processWidgetSettings,
  validateWidgetSettings,
  getDefaultWidgetSettings,
  getWidgetSettings,
  updateWidgetSettings,
  WidgetSettings,
} from './widgetSettingsProcessor';
import { ParsedUrlParameters } from '@/utils/urlParsing/urlParameterParser';

// Mock the widget registry
jest.mock('@/components/widgets/widgetRegistry', () => ({
  WIDGET_REGISTRY: new Map([
    ['frequency-analysis', {
      id: 'frequency-analysis',
      name: 'Frequency Analysis',
      description: 'Analyze character frequency in text',
      settingsKey: 'frequencyAnalysisSettings',
      defaultSettings: { ngramSize: 2, ngramMode: 'sliding' },
      parser: (value: any) => ({
        ngramSize: value.ngramSize ?? 2,
        ngramMode: value.ngramMode ?? 'sliding',
      }),
      validator: (settings: any) => {
        return typeof settings.ngramSize === 'number' && ['sliding', 'block'].includes(settings.ngramMode);
      },
    }],
    ['frequency-std-dev', {
      id: 'frequency-std-dev',
      name: 'Frequency Standard Deviation',
      description: 'Calculate standard deviation of character frequencies',
      // No settings fields
    }],
    ['kolmogorov-smirnov', {
      id: 'kolmogorov-smirnov',
      name: 'Kolmogorov-Smirnov Test',
      description: 'Perform Kolmogorov-Smirnov statistical test',
      // No settings fields
    }],
    ['shannon-entropy', {
      id: 'shannon-entropy',
      name: 'Shannon Entropy',
      description: 'Calculate information entropy',
      settingsKey: 'shannonEntropySettings',
      defaultSettings: { mode: 'raw', windowSize: 64 },
      parser: (value: any) => ({
        mode: value.mode ?? 'raw',
        windowSize: value.windowSize ?? 64,
      }),
      validator: (settings: any) => {
        return ['raw', 'sliding'].includes(settings.mode) && [16, 32, 64, 128, 256].includes(settings.windowSize);
      },
    }],
    ['ascii-distribution', {
      id: 'ascii-distribution',
      name: 'ASCII Distribution',
      description: 'Analyze ASCII character distribution',
      settingsKey: 'asciiDistributionSettings',
      defaultSettings: { range: 'extended' },
      parser: (value: any) => ({
        range: value.range ?? 'extended',
      }),
      validator: (settings: any) => {
        return ['extended', 'ascii', 'input'].includes(settings.range);
      },
    }],
  ]),
}));

describe('widgetSettingsProcessor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('widgets with and without settings', () => {
    it('should skip widgets without settings when processing', () => {
      const params: ParsedUrlParameters = {
        frequencyAnalysisSettings: { ngramSize: 3, ngramMode: 'block' },
        // No settings for frequency-std-dev or kolmogorov-smirnov
      };
      const result = processWidgetSettings(params);
      expect(result).toEqual({
        'frequency-analysis': { ngramSize: 3, ngramMode: 'block' },
      });
      expect(result['frequency-std-dev']).toBeUndefined();
      expect(result['kolmogorov-smirnov']).toBeUndefined();
    });

    it('should not include widgets without settings in getDefaultWidgetSettings', () => {
      const defaults = getDefaultWidgetSettings();
      // Should not include widgets without settings
      expect(defaults['frequency-std-dev']).toBeUndefined();
      expect(defaults['kolmogorov-smirnov']).toBeUndefined();
      // Should include widgets with settings
      expect(defaults['frequency-analysis']).toEqual({ ngramSize: 2, ngramMode: 'sliding' });
      expect(defaults['ascii-distribution']).toEqual({ range: 'extended' });
      expect(defaults['shannon-entropy']).toEqual({ mode: 'raw', windowSize: 64 });
      // Should not throw for any widget
      expect(Object.keys(defaults)).not.toContain('frequency-std-dev');
      expect(Object.keys(defaults)).not.toContain('kolmogorov-smirnov');
    });

    it('should not update settings for widgets without settings', () => {
      const currentSettings: WidgetSettings = {
        'frequency-analysis': { ngramSize: 2, ngramMode: 'sliding' },
      };
      const newSettings = { ngramSize: 4, ngramMode: 'block' };
      // Should update for widget with settings
      const updated = updateWidgetSettings('frequency-analysis', newSettings, currentSettings);
      expect(updated['frequency-analysis']).toEqual({ ngramSize: 4, ngramMode: 'block' });
      // Should not update for widget without settings
      const updated2 = updateWidgetSettings('frequency-std-dev', { foo: 'bar' }, currentSettings);
      expect(updated2).toEqual(currentSettings);
    });
  });

  describe('processWidgetSettings', () => {
    it('should process valid widget settings from URL parameters', () => {
      const params: ParsedUrlParameters = {
        frequencyAnalysisSettings: { ngramSize: 3, ngramMode: 'block' },
        shannonEntropySettings: { mode: 'sliding', windowSize: 128 },
        asciiDistributionSettings: { range: 'ascii' },
      };

      const result = processWidgetSettings(params);

      expect(result).toEqual({
        'frequency-analysis': { ngramSize: 3, ngramMode: 'block' },
        'shannon-entropy': { mode: 'sliding', windowSize: 128 },
        'ascii-distribution': { range: 'ascii' },
      });
    });

    it('should apply parsers when available', () => {
      const params: ParsedUrlParameters = {
        frequencyAnalysisSettings: { ngramSize: 3 }, // Missing ngramMode
      };

      const result = processWidgetSettings(params);

      expect(result['frequency-analysis']).toEqual({
        ngramSize: 3,
        ngramMode: 'sliding', // Applied by parser
      });
    });

    it('should skip invalid settings', () => {
      const params: ParsedUrlParameters = {
        frequencyAnalysisSettings: { ngramSize: 'invalid', ngramMode: 'invalid' },
        shannonEntropySettings: { mode: 'sliding', windowSize: 128 },
      };

      const result = processWidgetSettings(params);

      expect(result['frequency-analysis']).toBeUndefined(); // Skipped due to invalid settings
      expect(result['shannon-entropy']).toEqual({ mode: 'sliding', windowSize: 128 });
    });

    it('should handle empty parameters', () => {
      const params: ParsedUrlParameters = {};

      const result = processWidgetSettings(params);

      expect(result).toEqual({});
    });

    it('should handle unknown settings keys', () => {
      const params = {
        unknownSettings: { someValue: 'test' },
      } as ParsedUrlParameters;

      const result = processWidgetSettings(params);

      expect(result).toEqual({});
    });
  });

  describe('validateWidgetSettings', () => {
    it('should return true for valid settings', () => {
      const settings: WidgetSettings = {
        'frequency-analysis': { ngramSize: 2, ngramMode: 'sliding' },
        'shannon-entropy': { mode: 'raw', windowSize: 64 },
        'ascii-distribution': { range: 'extended' },
      };

      const result = validateWidgetSettings(settings);

      expect(result).toBe(true);
    });

    it('should return false for invalid settings', () => {
      const settings: WidgetSettings = {
        'frequency-analysis': { ngramSize: 'invalid', ngramMode: 'invalid' },
        'shannon-entropy': { mode: 'raw', windowSize: 64 },
      };

      const result = validateWidgetSettings(settings);

      expect(result).toBe(false);
    });

    it('should handle widgets without validators', () => {
      const settings: WidgetSettings = {
        'unknown-widget': { someValue: 'test' },
      };

      const result = validateWidgetSettings(settings);

      expect(result).toBe(true); // No validator means it's considered valid
    });

    it('should handle empty settings', () => {
      const settings: WidgetSettings = {};

      const result = validateWidgetSettings(settings);

      expect(result).toBe(true);
    });
  });

  describe('getDefaultWidgetSettings', () => {
    it('should return default settings for all registered widgets', () => {
      const result = getDefaultWidgetSettings();

      expect(result).toEqual({
        'frequency-analysis': { ngramSize: 2, ngramMode: 'sliding' },
        'shannon-entropy': { mode: 'raw', windowSize: 64 },
        'ascii-distribution': { range: 'extended' },
      });
    });
  });

  describe('getWidgetSettings', () => {
    it('should return settings for a specific widget', () => {
      const settings: WidgetSettings = {
        'frequency-analysis': { ngramSize: 3, ngramMode: 'block' },
        'shannon-entropy': { mode: 'sliding', windowSize: 128 },
      };

      const result = getWidgetSettings('frequency-analysis', settings);

      expect(result).toEqual({ ngramSize: 3, ngramMode: 'block' });
    });

    it('should return undefined for non-existent widget', () => {
      const settings: WidgetSettings = {
        'frequency-analysis': { ngramSize: 2, ngramMode: 'sliding' },
      };

      const result = getWidgetSettings('non-existent', settings);

      expect(result).toBeUndefined();
    });

    it('should return undefined for non-existent settings', () => {
      const settings: WidgetSettings = {};

      const result = getWidgetSettings('frequency-analysis', settings);

      expect(result).toBeUndefined();
    });
  });

  describe('updateWidgetSettings', () => {
    it('should update settings for a valid widget', () => {
      const currentSettings: WidgetSettings = {
        'frequency-analysis': { ngramSize: 2, ngramMode: 'sliding' },
        'shannon-entropy': { mode: 'raw', windowSize: 64 },
      };

      const newSettings = { ngramSize: 3, ngramMode: 'block' };

      const result = updateWidgetSettings('frequency-analysis', newSettings, currentSettings);

      expect(result).toEqual({
        'frequency-analysis': { ngramSize: 3, ngramMode: 'block' },
        'shannon-entropy': { mode: 'raw', windowSize: 64 },
      });
    });

    it('should apply parser when updating settings', () => {
      const currentSettings: WidgetSettings = {
        'frequency-analysis': { ngramSize: 2, ngramMode: 'sliding' },
      };

      const newSettings = { ngramSize: 3 }; // Missing ngramMode

      const result = updateWidgetSettings('frequency-analysis', newSettings, currentSettings);

      expect(result['frequency-analysis']).toEqual({
        ngramSize: 3,
        ngramMode: 'sliding', // Applied by parser
      });
    });

    it('should reject invalid settings', () => {
      const currentSettings: WidgetSettings = {
        'frequency-analysis': { ngramSize: 2, ngramMode: 'sliding' },
      };

      const newSettings = { ngramSize: 'invalid', ngramMode: 'invalid' };

      const result = updateWidgetSettings('frequency-analysis', newSettings, currentSettings);

      expect(result).toEqual(currentSettings); // No change due to invalid settings
    });

    it('should handle non-existent widget', () => {
      const currentSettings: WidgetSettings = {
        'frequency-analysis': { ngramSize: 2, ngramMode: 'sliding' },
      };

      const newSettings = { someValue: 'test' };

      const result = updateWidgetSettings('non-existent', newSettings, currentSettings);

      expect(result).toEqual(currentSettings); // No change for non-existent widget
    });

    it('should handle widgets without validators', () => {
      const currentSettings: WidgetSettings = {
        'ascii-distribution': { range: 'extended' },
      };

      const newSettings = { range: 'ascii' };

      const result = updateWidgetSettings('ascii-distribution', newSettings, currentSettings);

      expect(result['ascii-distribution']).toEqual({ range: 'ascii' });
    });
  });
});