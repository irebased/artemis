import {
  buildUrlParameters,
  buildLegacyUrlParameters,
  updateBrowserUrl,
  synchronizeDashboardState,
  synchronizeLayoutChanges,
  isCompressedFormatMoreEfficient,
  DashboardState,
  LegacyState,
} from './urlStateSynchronizer';
import { Ciphertext } from '@/types/ciphertext';
import { AsciiRange } from '@/types/dashboard/dashboardTypes';
import { BaseType } from '@/types/bases';

// Mock the compression and settings utilities
jest.mock('@/utils/compression/compressionUtils');
jest.mock('@/utils/settings/settingsUtils');
jest.mock('lz-string');

const mockCompressLZMA = require('@/utils/compression/compressionUtils').compressLZMA;
const mockCompressSettings = require('@/utils/settings/settingsUtils').compressSettings;
const mockCompressToEncodedURIComponent = require('lz-string').compressToEncodedURIComponent;

// Mock window.history
const mockReplaceState = jest.fn();

// Mock window object
global.window = {
  history: {
    replaceState: mockReplaceState,
  },
  location: {
    pathname: '/dashboard',
  },
} as any;

describe('urlStateSynchronizer', () => {
  const mockCiphertext: Ciphertext = {
    id: 1,
    text: 'test',
    encoding: 'ascii',
    ignorePunctuation: false,
    ignoreWhitespace: false,
    ignoreCasing: false,
    color: '#3b82f6',
  };

  const mockDashboardState: DashboardState = {
    inputs: [mockCiphertext],
    inputsForUrlSync: null,
    widgets: ['frequency-analysis', 'shannon-entropy'],
    layouts: { lg: [], md: [], sm: [] },
    asciiDistributionSettings: { range: 'extended' },
    indexOfCoincidenceSettings: { mode: 'summary' },
    loading: false,
    layoutLocked: true,
    frequencyAnalysisSettings: { ngramSize: 2, ngramMode: 'sliding' },
    shannonEntropySettings: { mode: 'raw', windowSize: 64 },
    kolmogorovSmirnovSettings: { ngramSize: 2, ngramMode: 'sliding' },
    chiSquaredSettings: { selectedTextIndex: 0, baseDataIndex: 1 },
    dashboardName: 'My Dashboard',
  };

  const mockLegacyState: LegacyState = {
    widgets: ['frequency-analysis'],
    inputs: [mockCiphertext],
    asciiBase: 'ascii',
    entropyMode: 'sliding',
    entropyWindow: 128,
    icMode: 'summary',
    layouts: { lg: [], md: [], sm: [] },
    asciiRange: 'extended',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCompressLZMA.mockResolvedValue('compressed-data');
    mockCompressSettings.mockReturnValue('compressed-settings');
    mockCompressToEncodedURIComponent.mockReturnValue('compressed-text');
  });

  describe('buildUrlParameters', () => {
    it('should build URL parameters for complete state', async () => {
      const params = await buildUrlParameters(mockDashboardState);

      expect(params.get('widgets')).toBe('frequency-analysis,shannon-entropy');
      expect(params.get('lock')).toBe('1');
      expect(params.get('freqSettings')).toBe('compressed-settings');
      expect(params.get('entropySettings')).toBe('compressed-settings');
      expect(params.get('asciiSettings')).toBe('compressed-settings');
      expect(params.get('icSettings')).toBe('compressed-settings');
      expect(params.get('ksSettings')).toBe('compressed-settings');
      expect(params.get('chiSquaredSettings')).toBe('compressed-settings');
      expect(params.get('name')).toBe('My%20Dashboard');
      expect(params.get('lzdata_layout')).toBe('compressed-data');
      expect(params.get('lzdata')).toBe('compressed-data');
    });

    it('should handle empty widgets array', async () => {
      const state = { ...mockDashboardState, widgets: [] };
      const params = await buildUrlParameters(state);

      expect(params.get('widgets')).toBeNull();
    });

    it('should handle default dashboard name', async () => {
      const state = { ...mockDashboardState, dashboardName: 'Artemis Dashboard' };
      const params = await buildUrlParameters(state);

      expect(params.get('name')).toBeNull();
    });

    it('should handle null layouts', async () => {
      const state = { ...mockDashboardState, layouts: null };
      const params = await buildUrlParameters(state);

      expect(params.get('lzdata_layout')).toBeNull();
      expect(params.get('lzdata')).toBeNull();
    });

    it('should use inputsForUrlSync when provided', async () => {
      const overrideInputs = [{ ...mockCiphertext, id: 2, text: 'override' }];
      const state = { ...mockDashboardState, inputsForUrlSync: overrideInputs };

      await buildUrlParameters(state);

      expect(mockCompressLZMA).toHaveBeenCalledWith(JSON.stringify(overrideInputs));
    });

    it('should handle missing settings', async () => {
      const state = {
        ...mockDashboardState,
        frequencyAnalysisSettings: null,
        shannonEntropySettings: null,
        asciiDistributionSettings: null,
        indexOfCoincidenceSettings: null,
        kolmogorovSmirnovSettings: null,
        chiSquaredSettings: null,
      };
      const params = await buildUrlParameters(state);

      expect(params.get('freqSettings')).toBeNull();
      expect(params.get('entropySettings')).toBeNull();
      expect(params.get('asciiSettings')).toBeNull();
      expect(params.get('icSettings')).toBeNull();
      expect(params.get('ksSettings')).toBeNull();
      expect(params.get('chiSquaredSettings')).toBeNull();
    });
  });

  describe('buildLegacyUrlParameters', () => {
    it('should build legacy URL parameters', async () => {
      const result = await buildLegacyUrlParameters(mockLegacyState);

      expect(result.params.get('widgets')).toBe('frequency-analysis');
      expect(result.params.get('data')).toBe('compressed-text');
      expect(result.params.get('base')).toBe('ascii');
      expect(result.params.get('entropyMode')).toBe('sliding');
      expect(result.params.get('entropyWindow')).toBe('128');
      expect(result.params.get('icMode')).toBe('summary');
      expect(result.params.get('ignorePunctuation')).toBe('false');
      expect(result.params.get('ignoreWhitespace')).toBe('false');
      expect(result.params.get('ignoreCasing')).toBe('false');
      expect(result.params.get('asciiRange')).toBe('extended');
      expect(result.compressedData).toBe('compressed-data');
    });

    it('should handle empty widgets array', async () => {
      const state = { ...mockLegacyState, widgets: [] };
      const result = await buildLegacyUrlParameters(state);

      expect(result.params.get('widgets')).toBeNull();
    });

    it('should handle empty inputs array', async () => {
      const state = { ...mockLegacyState, inputs: [] };
      const result = await buildLegacyUrlParameters(state);

      expect(result.params.get('data')).toBeNull();
    });

    it('should handle raw entropy mode', async () => {
      const state = { ...mockLegacyState, entropyMode: 'raw' as const };
      const result = await buildLegacyUrlParameters(state);

      expect(result.params.get('entropyMode')).toBe('raw');
      expect(result.params.get('entropyWindow')).toBeNull();
    });

    it('should handle mixed boolean input settings', async () => {
      const mixedInputs = [
        { ...mockCiphertext, ignorePunctuation: true },
        { ...mockCiphertext, id: 2, ignorePunctuation: false },
      ];
      const state = { ...mockLegacyState, inputs: mixedInputs };
      const result = await buildLegacyUrlParameters(state);

      expect(result.params.get('ignorePunctuation')).toBe('false');
    });

    it('should handle all true boolean input settings', async () => {
      const trueInputs = [
        { ...mockCiphertext, ignorePunctuation: true, ignoreWhitespace: true, ignoreCasing: true },
      ];
      const state = { ...mockLegacyState, inputs: trueInputs };
      const result = await buildLegacyUrlParameters(state);

      expect(result.params.get('ignorePunctuation')).toBe('true');
      expect(result.params.get('ignoreWhitespace')).toBe('true');
      expect(result.params.get('ignoreCasing')).toBe('true');
    });
  });

  describe('updateBrowserUrl', () => {
    it('should update URL with parameters', () => {
      const params = new URLSearchParams();
      params.set('widgets', 'test');

      updateBrowserUrl(params);

      expect(mockReplaceState).toHaveBeenCalledWith(null, '', '/dashboard?widgets=test');
    });

    it('should use compressed format when more efficient', () => {
      const params = new URLSearchParams();
      params.set('widgets', 'very-long-widget-name-that-makes-this-query-very-long');
      const compressedData = 'short';

      updateBrowserUrl(params, compressedData);

      expect(mockReplaceState).toHaveBeenCalledWith(null, '', '/dashboard?lzdata=short');
    });

    it('should use legacy format when more efficient', () => {
      const params = new URLSearchParams();
      params.set('widgets', 'short');
      const compressedData = 'very-long-compressed-data-that-is-longer-than-the-query';

      updateBrowserUrl(params, compressedData);

      expect(mockReplaceState).toHaveBeenCalledWith(null, '', '/dashboard?widgets=short');
    });
  });

  describe('synchronizeDashboardState', () => {
    it('should synchronize dashboard state to URL', async () => {
      await synchronizeDashboardState(mockDashboardState);

      expect(mockCompressLZMA).toHaveBeenCalled();
      expect(mockCompressSettings).toHaveBeenCalled();
      expect(mockReplaceState).toHaveBeenCalled();
    });

    it('should not synchronize when loading', async () => {
      const loadingState = { ...mockDashboardState, loading: true };

      await synchronizeDashboardState(loadingState);

      expect(mockCompressLZMA).not.toHaveBeenCalled();
      expect(mockReplaceState).not.toHaveBeenCalled();
    });
  });

  describe('synchronizeLayoutChanges', () => {
    it('should synchronize layout changes to URL', async () => {
      await synchronizeLayoutChanges(mockLegacyState);

      expect(mockCompressLZMA).toHaveBeenCalledTimes(2); // Once for data, once for layouts
      expect(mockCompressToEncodedURIComponent).toHaveBeenCalled();
      expect(mockReplaceState).toHaveBeenCalled();
    });

    it('should handle null layouts', async () => {
      const state = { ...mockLegacyState, layouts: null };

      await synchronizeLayoutChanges(state);

      expect(mockCompressLZMA).toHaveBeenCalledTimes(1); // Only for data
      expect(mockReplaceState).toHaveBeenCalled();
    });
  });

  describe('isCompressedFormatMoreEfficient', () => {
    it('should return true when compressed is shorter', () => {
      const result = isCompressedFormatMoreEfficient('short', 'very-long-query-string');

      expect(result).toBe(true);
    });

    it('should return false when legacy is shorter', () => {
      const result = isCompressedFormatMoreEfficient('very-long-compressed-data', 'short');

      expect(result).toBe(false);
    });

    it('should return false when lengths are equal', () => {
      const result = isCompressedFormatMoreEfficient('data', 'data');

      expect(result).toBe(false);
    });

    it('should account for the +2 overhead', () => {
      const result = isCompressedFormatMoreEfficient('data', 'data');

      expect(result).toBe(false);
    });
  });
});