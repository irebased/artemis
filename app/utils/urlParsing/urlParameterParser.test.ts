import {
  parseEntropyMode,
  parseEntropyWindow,
  parseAsciiRange,
  parseLayoutLock,
  parseBooleanParam,
  parseWidgets,
  parseDashboardName,
  parseCompressedInputs,
  parseCompressedLayouts,
  parseLegacyLayout,
  parseCompressedSettings,
  parseAllUrlParameters,
  isLoadingComplete,
  ParsedUrlParameters,
  LoadingState,
} from './urlParameterParser';
import { Ciphertext } from '@/types/ciphertext';

// Mock the compression and settings utilities
jest.mock('@/utils/compression/compressionUtils');
jest.mock('@/utils/settings/settingsUtils');
jest.mock('lz-string');

const mockDecompressLZMA = require('@/utils/compression/compressionUtils').decompressLZMA;
const mockDecompressSettings = require('@/utils/settings/settingsUtils').decompressSettings;
const mockDecompressFromEncodedURIComponent = require('lz-string').decompressFromEncodedURIComponent;

describe('urlParameterParser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseEntropyMode', () => {
    it('should return valid entropy mode', () => {
      expect(parseEntropyMode('raw')).toBe('raw');
      expect(parseEntropyMode('sliding')).toBe('sliding');
    });

    it('should return undefined for invalid modes', () => {
      expect(parseEntropyMode('invalid')).toBeUndefined();
      expect(parseEntropyMode('')).toBeUndefined();
      expect(parseEntropyMode(null)).toBeUndefined();
    });
  });

  describe('parseEntropyWindow', () => {
    it('should return valid window size', () => {
      expect(parseEntropyWindow('64')).toBe(64);
      expect(parseEntropyWindow('128')).toBe(128);
      expect(parseEntropyWindow('256')).toBe(256);
    });

    it('should return undefined for invalid values', () => {
      expect(parseEntropyWindow('invalid')).toBeUndefined();
      expect(parseEntropyWindow('64.5')).toBe(64); // parseInt truncates decimals
      expect(parseEntropyWindow('')).toBeUndefined();
      expect(parseEntropyWindow(null)).toBeUndefined();
    });
  });

  describe('parseAsciiRange', () => {
    it('should return valid ASCII range', () => {
      expect(parseAsciiRange('extended')).toBe('extended');
      expect(parseAsciiRange('ascii')).toBe('ascii');
      expect(parseAsciiRange('input')).toBe('input');
    });

    it('should return undefined for invalid ranges', () => {
      expect(parseAsciiRange('invalid')).toBeUndefined();
      expect(parseAsciiRange('')).toBeUndefined();
      expect(parseAsciiRange(null)).toBeUndefined();
    });
  });

  describe('parseLayoutLock', () => {
    it('should return true for valid lock values', () => {
      expect(parseLayoutLock('1')).toBe(true);
      expect(parseLayoutLock('true')).toBe(true);
    });

    it('should return false for invalid lock values', () => {
      expect(parseLayoutLock('0')).toBe(false);
      expect(parseLayoutLock('false')).toBe(false);
      expect(parseLayoutLock('invalid')).toBe(false);
      expect(parseLayoutLock('')).toBe(false);
      expect(parseLayoutLock(null)).toBe(false);
    });
  });

  describe('parseBooleanParam', () => {
    it('should return true for "true"', () => {
      expect(parseBooleanParam('true')).toBe(true);
    });

    it('should return false for "false"', () => {
      expect(parseBooleanParam('false')).toBe(false);
    });

    it('should return undefined for null', () => {
      expect(parseBooleanParam(null)).toBeUndefined();
    });

    it('should return false for other values', () => {
      expect(parseBooleanParam('invalid')).toBe(false);
      expect(parseBooleanParam('')).toBe(false);
    });
  });

  describe('parseWidgets', () => {
    const mockWidgetDefaults = {
      'frequency-analysis': {},
      'shannon-entropy': {},
      'ascii-distribution': {},
    };

    it('should return valid widget list', () => {
      const result = parseWidgets('frequency-analysis,shannon-entropy', mockWidgetDefaults);
      expect(result).toEqual(['frequency-analysis', 'shannon-entropy']);
    });

    it('should filter out invalid widgets', () => {
      const result = parseWidgets('frequency-analysis,invalid-widget,shannon-entropy', mockWidgetDefaults);
      expect(result).toEqual(['frequency-analysis', 'shannon-entropy']);
    });

    it('should return empty array for null parameter', () => {
      const result = parseWidgets(null, mockWidgetDefaults);
      expect(result).toEqual([]);
    });

    it('should return empty array for empty string', () => {
      const result = parseWidgets('', mockWidgetDefaults);
      expect(result).toEqual([]);
    });

    it('should handle single widget', () => {
      const result = parseWidgets('frequency-analysis', mockWidgetDefaults);
      expect(result).toEqual(['frequency-analysis']);
    });
  });

  describe('parseDashboardName', () => {
    it('should decode URI component', () => {
      const result = parseDashboardName('My%20Dashboard');
      expect(result).toBe('My Dashboard');
    });

    it('should return undefined for null', () => {
      const result = parseDashboardName(null);
      expect(result).toBeUndefined();
    });

    it('should handle already decoded names', () => {
      const result = parseDashboardName('My Dashboard');
      expect(result).toBe('My Dashboard');
    });
  });

  describe('parseCompressedInputs', () => {
    const mockInputs: Ciphertext[] = [
      {
        id: 1,
        text: 'test',
        encoding: 'ascii',
        ignorePunctuation: false,
        ignoreWhitespace: false,
        ignoreCasing: false,
        color: '#3b82f6',
      },
    ];

    it('should parse valid compressed inputs', async () => {
      mockDecompressLZMA.mockResolvedValue(JSON.stringify(mockInputs));

      const result = await parseCompressedInputs('compressed-data');

      expect(result).toEqual(mockInputs);
      expect(mockDecompressLZMA).toHaveBeenCalledWith('compressed-data');
    });

    it('should return undefined for null parameter', async () => {
      const result = await parseCompressedInputs(null);
      expect(result).toBeUndefined();
    });

    it('should return undefined for decompression error', async () => {
      mockDecompressLZMA.mockRejectedValue(new Error('Decompression failed'));

      const result = await parseCompressedInputs('compressed-data');

      expect(result).toBeUndefined();
    });

    it('should return undefined for invalid JSON', async () => {
      mockDecompressLZMA.mockResolvedValue('invalid-json');

      const result = await parseCompressedInputs('compressed-data');

      expect(result).toBeUndefined();
    });

    it('should return undefined for non-array data', async () => {
      mockDecompressLZMA.mockResolvedValue(JSON.stringify({ not: 'array' }));

      const result = await parseCompressedInputs('compressed-data');

      expect(result).toBeUndefined();
    });
  });

  describe('parseCompressedLayouts', () => {
    const mockLayouts = { lg: [], md: [], sm: [] };

    it('should parse valid compressed layouts', async () => {
      mockDecompressLZMA.mockResolvedValue(JSON.stringify(mockLayouts));

      const result = await parseCompressedLayouts('compressed-layouts');

      expect(result).toEqual(mockLayouts);
      expect(mockDecompressLZMA).toHaveBeenCalledWith('compressed-layouts');
    });

    it('should return undefined for null parameter', async () => {
      const result = await parseCompressedLayouts(null);
      expect(result).toBeUndefined();
    });

    it('should return undefined for decompression error', async () => {
      mockDecompressLZMA.mockRejectedValue(new Error('Decompression failed'));

      const result = await parseCompressedLayouts('compressed-layouts');

      expect(result).toBeUndefined();
    });

    it('should return undefined for invalid JSON', async () => {
      mockDecompressLZMA.mockResolvedValue('invalid-json');

      const result = await parseCompressedLayouts('compressed-layouts');

      expect(result).toBeUndefined();
    });
  });

  describe('parseLegacyLayout', () => {
    const mockLayouts = { lg: [], md: [], sm: [] };

    it('should parse valid legacy layout', () => {
      mockDecompressFromEncodedURIComponent.mockReturnValue(JSON.stringify(mockLayouts));

      const result = parseLegacyLayout('legacy-layout');

      expect(result).toEqual(mockLayouts);
      expect(mockDecompressFromEncodedURIComponent).toHaveBeenCalledWith('legacy-layout');
    });

    it('should return undefined for null parameter', () => {
      const result = parseLegacyLayout(null);
      expect(result).toBeUndefined();
    });

    it('should return undefined for decompression error', () => {
      mockDecompressFromEncodedURIComponent.mockImplementation(() => {
        throw new Error('Decompression failed');
      });

      const result = parseLegacyLayout('legacy-layout');

      expect(result).toBeUndefined();
    });

    it('should return undefined for invalid JSON', () => {
      mockDecompressFromEncodedURIComponent.mockReturnValue('invalid-json');

      const result = parseLegacyLayout('legacy-layout');

      expect(result).toBeUndefined();
    });
  });

  describe('parseCompressedSettings', () => {
    const mockSettings = { ngramSize: 2, ngramMode: 'sliding' };

    it('should parse valid compressed settings', () => {
      mockDecompressSettings.mockReturnValue(mockSettings);

      const result = parseCompressedSettings('compressed-settings');

      expect(result).toEqual(mockSettings);
      expect(mockDecompressSettings).toHaveBeenCalledWith('compressed-settings');
    });

    it('should return undefined for null parameter', () => {
      const result = parseCompressedSettings(null);
      expect(result).toBeUndefined();
    });

    it('should return undefined for decompression error', () => {
      mockDecompressSettings.mockImplementation(() => {
        throw new Error('Decompression failed');
      });

      const result = parseCompressedSettings('compressed-settings');

      expect(result).toBeUndefined();
    });
  });

  describe('parseAllUrlParameters', () => {
    const mockWidgetDefaults = {
      'frequency-analysis': {},
      'shannon-entropy': {},
    };

    const mockInputs: Ciphertext[] = [
      {
        id: 1,
        text: 'test',
        encoding: 'ascii',
        ignorePunctuation: false,
        ignoreWhitespace: false,
        ignoreCasing: false,
        color: '#3b82f6',
      },
    ];

    const mockLayouts = { lg: [], md: [], sm: [] };
    const mockSettings = { ngramSize: 2 };

    beforeEach(() => {
      mockDecompressLZMA
        .mockResolvedValueOnce(JSON.stringify(mockInputs))
        .mockResolvedValueOnce(JSON.stringify(mockLayouts));
      mockDecompressSettings.mockReturnValue(mockSettings);
    });

    it('should parse all parameters correctly', async () => {
      const query = new URLSearchParams();
      query.set('lzdata', 'compressed-inputs');
      query.set('lzdata_layout', 'compressed-layouts');
      query.set('widgets', 'frequency-analysis,shannon-entropy');
      query.set('entropyMode', 'sliding');
      query.set('entropyWindow', '128');
      query.set('ignorePunctuation', 'true');
      query.set('ignoreWhitespace', 'false');
      query.set('ignoreCasing', 'true');
      query.set('asciiRange', 'extended');
      query.set('lock', '1');
      query.set('freqSettings', 'compressed-settings');
      query.set('name', 'My%20Dashboard');

      const result = await parseAllUrlParameters(query, mockWidgetDefaults);

      expect(result).toEqual({
        inputs: mockInputs,
        layouts: mockLayouts,
        widgets: ['frequency-analysis', 'shannon-entropy'],
        dashboardName: 'My Dashboard',
        entropyMode: 'sliding',
        entropyWindow: 128,
        ignorePunctuation: true,
        ignoreWhitespace: false,
        ignoreCasing: true,
        asciiRange: 'extended',
        layoutLocked: true,
        frequencyAnalysisSettings: mockSettings,
        shannonEntropySettings: undefined,
        asciiDistributionSettings: undefined,
        indexOfCoincidenceSettings: undefined,
        kolmogorovSmirnovSettings: undefined,
        chiSquaredSettings: undefined,
      });
    });

    it('should handle missing parameters', async () => {
      const query = new URLSearchParams();

      const result = await parseAllUrlParameters(query, mockWidgetDefaults);

      expect(result).toEqual({
        inputs: undefined,
        layouts: undefined,
        widgets: [],
        dashboardName: undefined,
        entropyMode: undefined,
        entropyWindow: undefined,
        ignorePunctuation: undefined,
        ignoreWhitespace: undefined,
        ignoreCasing: undefined,
        asciiRange: undefined,
        layoutLocked: false,
        frequencyAnalysisSettings: undefined,
        shannonEntropySettings: undefined,
        asciiDistributionSettings: undefined,
        indexOfCoincidenceSettings: undefined,
        kolmogorovSmirnovSettings: undefined,
        chiSquaredSettings: undefined,
      });
    });

    it('should handle legacy layout parameter', async () => {
      const query = new URLSearchParams();
      query.set('layout', 'legacy-layout');

      mockDecompressFromEncodedURIComponent.mockReturnValue(JSON.stringify(mockLayouts));
      mockDecompressLZMA.mockResolvedValue(undefined);

      const result = await parseAllUrlParameters(query, mockWidgetDefaults);

      expect(result.layouts).toEqual(mockLayouts);
    });
  });

  describe('isLoadingComplete', () => {
    it('should return true when both inputs and layouts are loaded', () => {
      const loadingState: LoadingState = {
        loadedInputs: true,
        loadedLayouts: true,
        asyncLoads: 0,
      };

      const result = isLoadingComplete('lzdata', loadingState);
      expect(result).toBe(true);
    });

    it('should return false when inputs not loaded but lzdata exists', () => {
      const loadingState: LoadingState = {
        loadedInputs: false,
        loadedLayouts: true,
        asyncLoads: 0,
      };

      const result = isLoadingComplete('lzdata', loadingState);
      expect(result).toBe(false);
    });

    it('should return false when layouts not loaded', () => {
      const loadingState: LoadingState = {
        loadedInputs: true,
        loadedLayouts: false,
        asyncLoads: 0,
      };

      const result = isLoadingComplete('lzdata', loadingState);
      expect(result).toBe(false);
    });

    it('should return true when no lzdata and layouts loaded', () => {
      const loadingState: LoadingState = {
        loadedInputs: false,
        loadedLayouts: true,
        asyncLoads: 0,
      };

      const result = isLoadingComplete(null, loadingState);
      expect(result).toBe(true);
    });
  });
});