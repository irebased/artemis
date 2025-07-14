import {
  getWidgetConfig,
  getAllWidgetConfigs,
  getSettingsKeys,
  getDefaultSettings,
  getWidgetIds,
  validateWidgetSettings,
  WIDGET_REGISTRY,
} from './widgetRegistry';

// Mock the widget configs
jest.mock('./FrequencyAnalysisWidget/widgetConfig', () => ({
  __esModule: true,
  default: {
    id: 'frequency-analysis',
    name: 'Frequency Analysis',
    description: 'Analyze character frequency in text',
    settingsKey: 'frequencyAnalysisSettings',
    defaultSettings: { ngramSize: 2, ngramMode: 'sliding' },
    parser: jest.fn((value: any) => ({
      ngramSize: value.ngramSize ?? 2,
      ngramMode: value.ngramMode ?? 'sliding',
    })),
    validator: jest.fn((settings: any) => {
      return typeof settings.ngramSize === 'number' && ['sliding', 'block'].includes(settings.ngramMode);
    }),
  },
}));

jest.mock('./ShannonEntropyWidget/widgetConfig', () => ({
  __esModule: true,
  default: {
    id: 'shannon-entropy',
    name: 'Shannon Entropy',
    description: 'Calculate information entropy',
    settingsKey: 'shannonEntropySettings',
    defaultSettings: { mode: 'raw', windowSize: 64 },
    parser: jest.fn((value: any) => ({
      mode: value.mode ?? 'raw',
      windowSize: value.windowSize ?? 64,
    })),
    validator: jest.fn((settings: any) => {
      return ['raw', 'sliding'].includes(settings.mode) && [16, 32, 64, 128, 256].includes(settings.windowSize);
    }),
  },
}));

jest.mock('./AsciiDistributionWidget/widgetConfig', () => ({
  __esModule: true,
  default: {
    id: 'ascii-distribution',
    name: 'ASCII Distribution',
    description: 'Analyze ASCII character distribution',
    settingsKey: 'asciiDistributionSettings',
    defaultSettings: { range: 'extended' },
    parser: jest.fn((value: any) => ({
      range: value.range ?? 'extended',
    })),
    validator: jest.fn((settings: any) => {
      return ['extended', 'ascii', 'input'].includes(settings.range);
    }),
  },
}));

jest.mock('./IndexOfCoincidenceWidget/widgetConfig', () => ({
  __esModule: true,
  default: {
    id: 'index-of-coincidence',
    name: 'Index of Coincidence',
    description: 'Calculate the index of coincidence for text analysis',
    settingsKey: 'indexOfCoincidenceSettings',
    defaultSettings: { mode: 'summary', ngramSize: 2, ngramMode: 'sliding' },
    parser: jest.fn((value: any) => ({
      mode: value.mode ?? 'summary',
      ngramSize: value.ngramSize ?? 2,
      ngramMode: value.ngramMode ?? 'sliding',
    })),
    validator: jest.fn((settings: any) => {
      return ['summary', 'period'].includes(settings.mode);
    }),
  },
}));

jest.mock('./KolmogrovSmirnovWidget/widgetConfig', () => ({
  __esModule: true,
  default: {
    id: 'kolmogorov-smirnov',
    name: 'Kolmogorov-Smirnov Test',
    description: 'Perform Kolmogorov-Smirnov statistical test',
    settingsKey: 'kolmogorovSmirnovSettings',
    defaultSettings: { ngramSize: 2, ngramMode: 'sliding' },
    parser: jest.fn((value: any) => ({
      ngramSize: value.ngramSize ?? 2,
      ngramMode: value.ngramMode ?? 'sliding',
    })),
    validator: jest.fn((settings: any) => {
      return typeof settings.ngramSize === 'number' && ['sliding', 'block'].includes(settings.ngramMode);
    }),
  },
}));

jest.mock('./ChiSquaredWidget/widgetConfig', () => ({
  __esModule: true,
  default: {
    id: 'chi-squared',
    name: 'Chi-Squared Test',
    description: 'Perform Chi-squared statistical test',
    settingsKey: 'chiSquaredSettings',
    defaultSettings: { selectedTextIndex: 0, baseDataIndex: 'sample' },
    parser: jest.fn((value: any) => ({
      selectedTextIndex: value.selectedTextIndex ?? 0,
      baseDataIndex: value.baseDataIndex ?? 'sample',
    })),
    validator: jest.fn((settings: any) => {
      return typeof settings.selectedTextIndex === 'number' && settings.selectedTextIndex >= 0;
    }),
  },
}));

jest.mock('./FrequencyStdDevWidget/widgetConfig', () => ({
  __esModule: true,
  default: {
    id: 'frequency-std-dev',
    name: 'Frequency Standard Deviation',
    description: 'Calculate standard deviation of character frequencies',
    settingsKey: 'frequencyStdDevSettings',
    defaultSettings: { ngramSize: 2, ngramMode: 'sliding' },
    parser: jest.fn((value: any) => ({
      ngramSize: value.ngramSize ?? 2,
      ngramMode: value.ngramMode ?? 'sliding',
    })),
    validator: jest.fn((settings: any) => {
      return typeof settings.ngramSize === 'number' && ['sliding', 'block'].includes(settings.ngramMode);
    }),
  },
}));

describe('widgetRegistry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('WIDGET_REGISTRY', () => {
    it('should contain all expected widget configs', () => {
      const expectedIds = [
        'frequency-analysis',
        'shannon-entropy',
        'ascii-distribution',
        'index-of-coincidence',
        'kolmogorov-smirnov',
        'chi-squared',
        'frequency-std-dev',
      ];

      expectedIds.forEach(id => {
        expect(WIDGET_REGISTRY.has(id)).toBe(true);
      });

      expect(WIDGET_REGISTRY.size).toBe(7);
    });

    it('should have valid widget configs with all required properties', () => {
      WIDGET_REGISTRY.forEach((config, id) => {
        expect(config).toHaveProperty('id');
        expect(config).toHaveProperty('name');
        expect(config).toHaveProperty('description');
        expect(config).toHaveProperty('settingsKey');
        expect(config).toHaveProperty('defaultSettings');
        expect(config).toHaveProperty('parser');
        expect(config).toHaveProperty('validator');
        expect(typeof config.parser).toBe('function');
        expect(typeof config.validator).toBe('function');
      });
    });
  });

  describe('getWidgetConfig', () => {
    it('should return widget config for existing widget', () => {
      const config = getWidgetConfig('frequency-analysis');

      expect(config).toBeDefined();
      expect(config?.id).toBe('frequency-analysis');
      expect(config?.name).toBe('Frequency Analysis');
    });

    it('should return undefined for non-existent widget', () => {
      const config = getWidgetConfig('non-existent');

      expect(config).toBeUndefined();
    });
  });

  describe('getAllWidgetConfigs', () => {
            it('should return all widget configs', () => {
      const configs = getAllWidgetConfigs();

      expect(configs).toHaveLength(7);
      expect(configs.map(c => c.id).sort()).toEqual([
        'ascii-distribution',
        'chi-squared',
        'frequency-analysis',
        'frequency-std-dev',
        'index-of-coincidence',
        'kolmogorov-smirnov',
        'shannon-entropy',
      ].sort());
    });
  });

  describe('getSettingsKeys', () => {
            it('should return all settings keys', () => {
      const keys = getSettingsKeys();

      expect(keys.sort()).toEqual([
        'asciiDistributionSettings',
        'chiSquaredSettings',
        'frequencyAnalysisSettings',
        'frequencyStdDevSettings',
        'indexOfCoincidenceSettings',
        'kolmogorovSmirnovSettings',
        'shannonEntropySettings',
      ].sort());
    });
  });

  describe('getDefaultSettings', () => {
        it('should return default settings for all widgets', () => {
      const defaults = getDefaultSettings();

      expect(defaults).toEqual({
        'frequency-analysis': { ngramSize: 2, ngramMode: 'sliding' },
        'shannon-entropy': { mode: 'raw', windowSize: 64 },
        'ascii-distribution': { range: 'extended' },
        'index-of-coincidence': { mode: 'summary', ngramSize: 2, ngramMode: 'sliding' },
        'kolmogorov-smirnov': { ngramSize: 2, ngramMode: 'sliding' },
        'chi-squared': { selectedTextIndex: 0, baseDataIndex: 'sample' },
        'frequency-std-dev': { ngramSize: 2, ngramMode: 'sliding' },
      });
    });
  });

  describe('getWidgetIds', () => {
            it('should return all widget IDs', () => {
      const ids = getWidgetIds();

      expect(ids.sort()).toEqual([
        'ascii-distribution',
        'chi-squared',
        'frequency-analysis',
        'frequency-std-dev',
        'index-of-coincidence',
        'kolmogorov-smirnov',
        'shannon-entropy',
      ].sort());
    });
  });

  describe('validateWidgetSettings', () => {
    it('should return true for valid settings', () => {
      const settings = {
        'frequency-analysis': { ngramSize: 2, ngramMode: 'sliding' },
        'shannon-entropy': { mode: 'raw', windowSize: 64 },
        'ascii-distribution': { range: 'extended' },
      };

      const result = validateWidgetSettings(settings);
      expect(result).toBe(true);
    });

    it('should return false for invalid settings', () => {
      const settings = {
        'frequency-analysis': { ngramSize: 'invalid', ngramMode: 'invalid' },
        'shannon-entropy': { mode: 'raw', windowSize: 64 },
      };

      const result = validateWidgetSettings(settings);
      expect(result).toBe(false);
    });

    it('should handle widgets without settings', () => {
      const settings = {};

      const result = validateWidgetSettings(settings);
      expect(result).toBe(true);
    });

    it('should handle unknown widgets', () => {
      const settings = {
        'unknown-widget': { someValue: 'test' },
      };

      const result = validateWidgetSettings(settings);
      expect(result).toBe(true); // No validator means it's considered valid
    });
  });
});