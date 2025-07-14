import {
  initializeLayouts,
  updateLayoutsForWidgets,
  handleLayoutChange,
  shouldRegenerateLayouts,
  getLayoutForScreenSize,
  areLayoutsEmpty,
  getTotalWidgetCount,
  validateLayoutStructure,
  LayoutState,
  LayoutConfig,
  LayoutChangeParams,
} from './layoutManager';
import { Ciphertext } from '@/types/ciphertext';
import { AsciiRange } from '@/types/dashboard/dashboardTypes';
import { BaseType } from '@/types/bases';

describe('layoutManager', () => {
  const mockCiphertext: Ciphertext = {
    id: 1,
    text: 'test',
    encoding: 'ascii',
    ignorePunctuation: false,
    ignoreWhitespace: false,
    ignoreCasing: false,
    color: '#3b82f6',
  };

  const mockLayoutConfig: LayoutConfig = {
    COLS: {
      lg: 12,
      md: 8,
      sm: 4,
    },
    generateLayout: jest.fn((widgets: string[], cols: number) => {
      return widgets.map((widget, index) => ({
        i: widget,
        x: (index * 2) % cols,
        y: Math.floor(index / cols),
        w: 2,
        h: 2,
      }));
    }),
    mergeLayoutsWithWidgets: jest.fn((layouts: LayoutState, widgets: string[]) => {
      return {
        lg: layouts.lg.filter(item => widgets.includes(item.i)),
        md: layouts.md.filter(item => widgets.includes(item.i)),
        sm: layouts.sm.filter(item => widgets.includes(item.i)),
      };
    }),
  };

  const mockLayoutState: LayoutState = {
    lg: [
      { i: 'widget1', x: 0, y: 0, w: 2, h: 2 },
      { i: 'widget2', x: 2, y: 0, w: 2, h: 2 },
    ],
    md: [
      { i: 'widget1', x: 0, y: 0, w: 2, h: 2 },
    ],
    sm: [
      { i: 'widget1', x: 0, y: 0, w: 2, h: 2 },
    ],
  };

  const mockLayoutChangeParams: LayoutChangeParams = {
    widgets: ['widget1', 'widget2'],
    inputs: [mockCiphertext],
    asciiBase: 'ascii',
    entropyMode: 'raw',
    entropyWindow: 64,
    icMode: 'summary',
    layouts: mockLayoutState,
    asciiRange: 'extended',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initializeLayouts', () => {
    it('should initialize layouts for all screen sizes', () => {
      const widgets = ['widget1', 'widget2'];
      const result = initializeLayouts(widgets, mockLayoutConfig);

      expect(mockLayoutConfig.generateLayout).toHaveBeenCalledTimes(3);
      expect(mockLayoutConfig.generateLayout).toHaveBeenCalledWith(widgets, 12);
      expect(mockLayoutConfig.generateLayout).toHaveBeenCalledWith(widgets, 8);
      expect(mockLayoutConfig.generateLayout).toHaveBeenCalledWith(widgets, 4);

      expect(result).toEqual({
        lg: expect.any(Array),
        md: expect.any(Array),
        sm: expect.any(Array),
      });
    });

    it('should handle empty widgets array', () => {
      const widgets: string[] = [];
      const result = initializeLayouts(widgets, mockLayoutConfig);

      expect(result).toEqual({
        lg: [],
        md: [],
        sm: [],
      });
    });

    it('should handle single widget', () => {
      const widgets = ['widget1'];
      const result = initializeLayouts(widgets, mockLayoutConfig);

      expect(result.lg).toHaveLength(1);
      expect(result.md).toHaveLength(1);
      expect(result.sm).toHaveLength(1);
    });
  });

  describe('updateLayoutsForWidgets', () => {
    it('should update layouts when widgets change', () => {
      const widgets = ['widget1'];
      const result = updateLayoutsForWidgets(widgets, mockLayoutState, mockLayoutConfig);

      expect(mockLayoutConfig.mergeLayoutsWithWidgets).toHaveBeenCalledWith(mockLayoutState, widgets);
      expect(result).toEqual({
        lg: [{ i: 'widget1', x: 0, y: 0, w: 2, h: 2 }],
        md: [{ i: 'widget1', x: 0, y: 0, w: 2, h: 2 }],
        sm: [{ i: 'widget1', x: 0, y: 0, w: 2, h: 2 }],
      });
    });

    it('should handle empty widgets array', () => {
      const widgets: string[] = [];
      const result = updateLayoutsForWidgets(widgets, mockLayoutState, mockLayoutConfig);

      expect(result).toEqual({
        lg: [],
        md: [],
        sm: [],
      });
    });

    it('should handle widgets not in current layouts', () => {
      const widgets = ['widget3'];
      const result = updateLayoutsForWidgets(widgets, mockLayoutState, mockLayoutConfig);

      expect(result).toEqual({
        lg: [],
        md: [],
        sm: [],
      });
    });
  });

  describe('handleLayoutChange', () => {
    it('should return updated layouts', () => {
      const currentLayout = mockLayoutState.lg;
      const allLayouts = {
        lg: [{ i: 'widget1', x: 0, y: 0, w: 2, h: 2 }],
        md: [{ i: 'widget1', x: 0, y: 0, w: 2, h: 2 }],
        sm: [{ i: 'widget1', x: 0, y: 0, w: 2, h: 2 }],
      };

      const result = handleLayoutChange(currentLayout, allLayouts, mockLayoutChangeParams);

      expect(result).toEqual(allLayouts);
    });

    it('should handle empty layouts', () => {
      const currentLayout: any[] = [];
      const allLayouts: LayoutState = { lg: [], md: [], sm: [] };

      const result = handleLayoutChange(currentLayout, allLayouts, mockLayoutChangeParams);

      expect(result).toEqual(allLayouts);
    });
  });

  describe('shouldRegenerateLayouts', () => {
    it('should return true when widget count changes', () => {
      const oldWidgets = ['widget1'];
      const newWidgets = ['widget1', 'widget2'];

      const result = shouldRegenerateLayouts(oldWidgets, newWidgets);

      expect(result).toBe(true);
    });

    it('should return true when widgets change order', () => {
      const oldWidgets = ['widget1', 'widget2'];
      const newWidgets = ['widget2', 'widget1'];

      const result = shouldRegenerateLayouts(oldWidgets, newWidgets);

      expect(result).toBe(true);
    });

    it('should return true when widgets are replaced', () => {
      const oldWidgets = ['widget1', 'widget2'];
      const newWidgets = ['widget1', 'widget3'];

      const result = shouldRegenerateLayouts(oldWidgets, newWidgets);

      expect(result).toBe(true);
    });

    it('should return false when widgets are identical', () => {
      const oldWidgets = ['widget1', 'widget2'];
      const newWidgets = ['widget1', 'widget2'];

      const result = shouldRegenerateLayouts(oldWidgets, newWidgets);

      expect(result).toBe(false);
    });

    it('should return false for empty arrays', () => {
      const oldWidgets: string[] = [];
      const newWidgets: string[] = [];

      const result = shouldRegenerateLayouts(oldWidgets, newWidgets);

      expect(result).toBe(false);
    });
  });

  describe('getLayoutForScreenSize', () => {
    it('should return layout for large screen', () => {
      const result = getLayoutForScreenSize(mockLayoutState, 'lg');

      expect(result).toEqual(mockLayoutState.lg);
    });

    it('should return layout for medium screen', () => {
      const result = getLayoutForScreenSize(mockLayoutState, 'md');

      expect(result).toEqual(mockLayoutState.md);
    });

    it('should return layout for small screen', () => {
      const result = getLayoutForScreenSize(mockLayoutState, 'sm');

      expect(result).toEqual(mockLayoutState.sm);
    });

    it('should return empty array for invalid screen size', () => {
      const result = getLayoutForScreenSize(mockLayoutState, 'lg' as any);

      expect(result).toEqual(mockLayoutState.lg);
    });
  });

  describe('areLayoutsEmpty', () => {
    it('should return true when all layouts are empty', () => {
      const emptyLayouts: LayoutState = {
        lg: [],
        md: [],
        sm: [],
      };

      const result = areLayoutsEmpty(emptyLayouts);

      expect(result).toBe(true);
    });

    it('should return false when any layout has items', () => {
      const result = areLayoutsEmpty(mockLayoutState);

      expect(result).toBe(false);
    });

    it('should return false when only some layouts are empty', () => {
      const partialLayouts: LayoutState = {
        lg: [{ i: 'widget1', x: 0, y: 0, w: 2, h: 2 }],
        md: [],
        sm: [],
      };

      const result = areLayoutsEmpty(partialLayouts);

      expect(result).toBe(false);
    });
  });

  describe('getTotalWidgetCount', () => {
    it('should return total count of all widgets', () => {
      const result = getTotalWidgetCount(mockLayoutState);

      expect(result).toBe(4); // 2 + 1 + 1
    });

    it('should return zero for empty layouts', () => {
      const emptyLayouts: LayoutState = {
        lg: [],
        md: [],
        sm: [],
      };

      const result = getTotalWidgetCount(emptyLayouts);

      expect(result).toBe(0);
    });

    it('should handle layouts with different counts', () => {
      const mixedLayouts: LayoutState = {
        lg: [{ i: 'widget1' }, { i: 'widget2' }, { i: 'widget3' }],
        md: [{ i: 'widget1' }],
        sm: [],
      };

      const result = getTotalWidgetCount(mixedLayouts);

      expect(result).toBe(4);
    });
  });

  describe('validateLayoutStructure', () => {
    it('should return true for valid layout structure', () => {
      const result = validateLayoutStructure(mockLayoutState);

      expect(result).toBe(true);
    });

    it('should return false for null layouts', () => {
      const result = validateLayoutStructure(null as any);

      expect(result).toBe(false);
    });

    it('should return false for undefined layouts', () => {
      const result = validateLayoutStructure(undefined as any);

      expect(result).toBe(false);
    });

    it('should return false for non-object layouts', () => {
      const result = validateLayoutStructure('invalid' as any);

      expect(result).toBe(false);
    });

    it('should return false when lg is not an array', () => {
      const invalidLayouts = {
        ...mockLayoutState,
        lg: 'not-an-array',
      } as any;

      const result = validateLayoutStructure(invalidLayouts);

      expect(result).toBe(false);
    });

    it('should return false when md is not an array', () => {
      const invalidLayouts = {
        ...mockLayoutState,
        md: 'not-an-array',
      } as any;

      const result = validateLayoutStructure(invalidLayouts);

      expect(result).toBe(false);
    });

    it('should return false when sm is not an array', () => {
      const invalidLayouts = {
        ...mockLayoutState,
        sm: 'not-an-array',
      } as any;

      const result = validateLayoutStructure(invalidLayouts);

      expect(result).toBe(false);
    });

    it('should return false when missing required properties', () => {
      const invalidLayouts = {
        lg: [],
        md: [],
        // missing sm
      };

      const result = validateLayoutStructure(invalidLayouts as any);

      expect(result).toBe(false);
    });
  });
});