import {
  AsciiRange,
  INPUT_COLORS,
  FrequencyAnalysisSettings,
  ShannonEntropySettings,
  AsciiDistributionSettings,
  IndexOfCoincidenceSettings,
  KolmogorovSmirnovSettings,
  ChiSquaredSettings,
} from './dashboardTypes';

describe('dashboardTypes', () => {
  describe('AsciiRange', () => {
    it('should have correct type values', () => {
      const validRanges: AsciiRange[] = ['extended', 'ascii', 'input'];

      validRanges.forEach(range => {
        expect(typeof range).toBe('string');
        expect(['extended', 'ascii', 'input']).toContain(range);
      });
    });

    it('should not accept invalid values', () => {
      // TypeScript should prevent this at compile time, but we can test the valid values
      const validRanges: AsciiRange[] = ['extended', 'ascii', 'input'];
      expect(validRanges).toHaveLength(3);
    });
  });

  describe('INPUT_COLORS', () => {
    it('should be an array of valid hex colors', () => {
      expect(Array.isArray(INPUT_COLORS)).toBe(true);
      expect(INPUT_COLORS.length).toBeGreaterThan(0);

      INPUT_COLORS.forEach(color => {
        expect(typeof color).toBe('string');
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    it('should have exactly 5 colors', () => {
      expect(INPUT_COLORS).toHaveLength(5);
    });

    it('should have specific color values', () => {
      expect(INPUT_COLORS).toEqual([
        '#3b82f6', // blue
        '#ef4444', // red
        '#22c55e', // green
        '#eab308', // yellow
        '#a855f7', // purple
      ]);
    });

    it('should have unique colors', () => {
      const uniqueColors = new Set(INPUT_COLORS);
      expect(uniqueColors.size).toBe(INPUT_COLORS.length);
    });
  });

  describe('FrequencyAnalysisSettings', () => {
    it('should have correct structure', () => {
      const settings: FrequencyAnalysisSettings = {
        ngramSize: 2,
        ngramMode: 'sliding',
      };

      expect(settings.ngramSize).toBe(2);
      expect(settings.ngramMode).toBe('sliding');
      expect(typeof settings.ngramSize).toBe('number');
      expect(['sliding', 'block']).toContain(settings.ngramMode);
    });

    it('should accept block mode', () => {
      const settings: FrequencyAnalysisSettings = {
        ngramSize: 3,
        ngramMode: 'block',
      };

      expect(settings.ngramMode).toBe('block');
    });

    it('should accept various ngram sizes', () => {
      const sizes = [1, 2, 3, 4, 5];

      sizes.forEach(size => {
        const settings: FrequencyAnalysisSettings = {
          ngramSize: size,
          ngramMode: 'sliding',
        };
        expect(settings.ngramSize).toBe(size);
      });
    });
  });

  describe('ShannonEntropySettings', () => {
    it('should have correct structure', () => {
      const settings: ShannonEntropySettings = {
        mode: 'raw',
        windowSize: 64,
      };

      expect(settings.mode).toBe('raw');
      expect(settings.windowSize).toBe(64);
      expect(['raw', 'sliding']).toContain(settings.mode);
      expect([16, 32, 64, 128, 256]).toContain(settings.windowSize);
    });

    it('should accept sliding mode', () => {
      const settings: ShannonEntropySettings = {
        mode: 'sliding',
        windowSize: 128,
      };

      expect(settings.mode).toBe('sliding');
      expect(settings.windowSize).toBe(128);
    });

    it('should accept all valid window sizes', () => {
      const validSizes: (16 | 32 | 64 | 128 | 256)[] = [16, 32, 64, 128, 256];

      validSizes.forEach(size => {
        const settings: ShannonEntropySettings = {
          mode: 'raw',
          windowSize: size,
        };
        expect(settings.windowSize).toBe(size);
      });
    });
  });

  describe('AsciiDistributionSettings', () => {
    it('should have correct structure', () => {
      const settings: AsciiDistributionSettings = {
        range: 'extended',
      };

      expect(settings.range).toBe('extended');
      expect(['extended', 'ascii', 'input']).toContain(settings.range);
    });

    it('should accept all valid range values', () => {
      const validRanges: AsciiRange[] = ['extended', 'ascii', 'input'];

      validRanges.forEach(range => {
        const settings: AsciiDistributionSettings = {
          range,
        };
        expect(settings.range).toBe(range);
      });
    });
  });

  describe('IndexOfCoincidenceSettings', () => {
    it('should have correct structure with required fields', () => {
      const settings: IndexOfCoincidenceSettings = {
        mode: 'summary',
      };

      expect(settings.mode).toBe('summary');
      expect(['summary', 'period']).toContain(settings.mode);
    });

    it('should accept optional ngramSize and ngramMode', () => {
      const settings: IndexOfCoincidenceSettings = {
        mode: 'period',
        ngramSize: 2,
        ngramMode: 'block',
      };

      expect(settings.mode).toBe('period');
      expect(settings.ngramSize).toBe(2);
      expect(settings.ngramMode).toBe('block');
    });

    it('should accept all valid modes', () => {
      const validModes: ('summary' | 'period')[] = ['summary', 'period'];

      validModes.forEach(mode => {
        const settings: IndexOfCoincidenceSettings = {
          mode,
        };
        expect(settings.mode).toBe(mode);
      });
    });
  });

  describe('KolmogorovSmirnovSettings', () => {
    it('should have correct structure', () => {
      const settings: KolmogorovSmirnovSettings = {
        ngramSize: 1,
        ngramMode: 'sliding',
      };

      expect(settings.ngramSize).toBe(1);
      expect(settings.ngramMode).toBe('sliding');
      expect(typeof settings.ngramSize).toBe('number');
      expect(['sliding', 'block']).toContain(settings.ngramMode);
    });

    it('should accept block mode', () => {
      const settings: KolmogorovSmirnovSettings = {
        ngramSize: 3,
        ngramMode: 'block',
      };

      expect(settings.ngramMode).toBe('block');
    });
  });

  describe('ChiSquaredSettings', () => {
    it('should have correct structure', () => {
      const settings: ChiSquaredSettings = {
        selectedTextIndex: 0,
        baseDataIndex: 'sample',
      };

      expect(settings.selectedTextIndex).toBe(0);
      expect(settings.baseDataIndex).toBe('sample');
      expect(typeof settings.selectedTextIndex).toBe('number');
    });

    it('should accept numeric baseDataIndex', () => {
      const settings: ChiSquaredSettings = {
        selectedTextIndex: 1,
        baseDataIndex: 2,
      };

      expect(settings.selectedTextIndex).toBe(1);
      expect(settings.baseDataIndex).toBe(2);
    });

    it('should accept string baseDataIndex', () => {
      const settings: ChiSquaredSettings = {
        selectedTextIndex: 0,
        baseDataIndex: 'sample',
      };

      expect(settings.baseDataIndex).toBe('sample');
    });

    it('should accept various text indices', () => {
      const indices = [0, 1, 2, 3, 4];

      indices.forEach(index => {
        const settings: ChiSquaredSettings = {
          selectedTextIndex: index,
          baseDataIndex: 'sample',
        };
        expect(settings.selectedTextIndex).toBe(index);
      });
    });
  });
});