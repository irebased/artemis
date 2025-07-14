import {
  addInput,
  removeInput,
  updateInputText,
  createNewInput,
  canAddInput,
  getNextInputId,
} from './inputManager';
import { Ciphertext } from '@/types/ciphertext';
import { INPUT_COLORS } from '@/types/dashboard/dashboardTypes';

describe('inputManager', () => {
  let mockSetInputs: jest.Mock;
  let mockInputs: Ciphertext[];

  beforeEach(() => {
    mockSetInputs = jest.fn();
    mockInputs = [
      {
        id: 1,
        text: 'test1',
        encoding: 'ascii',
        ignorePunctuation: false,
        ignoreWhitespace: false,
        ignoreCasing: false,
        color: INPUT_COLORS[0],
      },
      {
        id: 2,
        text: 'test2',
        encoding: 'ascii',
        ignorePunctuation: true,
        ignoreWhitespace: true,
        ignoreCasing: true,
        color: INPUT_COLORS[1],
      },
    ];
  });

  describe('addInput', () => {
    it('should add a new input when under the limit', () => {
      addInput(mockInputs, mockSetInputs);

      expect(mockSetInputs).toHaveBeenCalledWith(expect.any(Function));

      const updater = mockSetInputs.mock.calls[0][0];
      const result = updater(mockInputs);

      expect(result).toHaveLength(3);
      expect(result[2]).toEqual({
        id: 3,
        text: '',
        encoding: 'ascii',
        ignorePunctuation: false,
        ignoreWhitespace: false,
        ignoreCasing: false,
        color: INPUT_COLORS[2],
      });
    });

    it('should not add input when at the limit (5 inputs)', () => {
      const maxInputs = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        text: `test${i + 1}`,
        encoding: 'ascii' as const,
        ignorePunctuation: false,
        ignoreWhitespace: false,
        ignoreCasing: false,
        color: INPUT_COLORS[i],
      }));

      addInput(maxInputs, mockSetInputs);

      expect(mockSetInputs).not.toHaveBeenCalled();
    });

    it('should not add input when over the limit', () => {
      const overLimitInputs = Array.from({ length: 6 }, (_, i) => ({
        id: i + 1,
        text: `test${i + 1}`,
        encoding: 'ascii' as const,
        ignorePunctuation: false,
        ignoreWhitespace: false,
        ignoreCasing: false,
        color: INPUT_COLORS[i % INPUT_COLORS.length],
      }));

      addInput(overLimitInputs, mockSetInputs);

      expect(mockSetInputs).not.toHaveBeenCalled();
    });

    it('should assign correct ID and color to new input', () => {
      addInput(mockInputs, mockSetInputs);

      const updater = mockSetInputs.mock.calls[0][0];
      const result = updater(mockInputs);
      const newInput = result[2];

      expect(newInput.id).toBe(3); // next ID after 1, 2
      expect(newInput.color).toBe(INPUT_COLORS[2]); // color at index 2
    });

    it('should create input with default values', () => {
      addInput(mockInputs, mockSetInputs);

      const updater = mockSetInputs.mock.calls[0][0];
      const result = updater(mockInputs);
      const newInput = result[2];

      expect(newInput.text).toBe('');
      expect(newInput.encoding).toBe('ascii');
      expect(newInput.ignorePunctuation).toBe(false);
      expect(newInput.ignoreWhitespace).toBe(false);
      expect(newInput.ignoreCasing).toBe(false);
    });
  });

  describe('removeInput', () => {
    it('should remove input with specified ID', () => {
      removeInput(1, mockSetInputs);

      expect(mockSetInputs).toHaveBeenCalledWith(expect.any(Function));

      const updater = mockSetInputs.mock.calls[0][0];
      const result = updater(mockInputs);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
      expect(result[0].text).toBe('test2');
    });

    it('should not remove any input if ID does not exist', () => {
      removeInput(999, mockSetInputs);

      const updater = mockSetInputs.mock.calls[0][0];
      const result = updater(mockInputs);

      expect(result).toHaveLength(2);
      expect(result).toEqual(mockInputs);
    });

    it('should handle removing from empty array', () => {
      removeInput(1, mockSetInputs);

      const updater = mockSetInputs.mock.calls[0][0];
      const result = updater([]);

      expect(result).toHaveLength(0);
    });

    it('should remove correct input when multiple inputs exist', () => {
      const multipleInputs = [
        { ...mockInputs[0], id: 1 },
        { ...mockInputs[1], id: 2 },
        { ...mockInputs[0], id: 3, text: 'test3' },
      ];

      removeInput(2, mockSetInputs);

      const updater = mockSetInputs.mock.calls[0][0];
      const result = updater(multipleInputs);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(3);
    });
  });

  describe('updateInputText', () => {
    it('should update text of input with specified ID', () => {
      updateInputText(1, 'updated text', mockSetInputs);

      expect(mockSetInputs).toHaveBeenCalledWith(expect.any(Function));

      const updater = mockSetInputs.mock.calls[0][0];
      const result = updater(mockInputs);

      expect(result[0].text).toBe('updated text');
      expect(result[1].text).toBe('test2'); // unchanged
    });

    it('should not update any input if ID does not exist', () => {
      updateInputText(999, 'updated text', mockSetInputs);

      const updater = mockSetInputs.mock.calls[0][0];
      const result = updater(mockInputs);

      expect(result).toEqual(mockInputs); // no changes
    });

    it('should handle empty string update', () => {
      updateInputText(1, '', mockSetInputs);

      const updater = mockSetInputs.mock.calls[0][0];
      const result = updater(mockInputs);

      expect(result[0].text).toBe('');
    });

    it('should handle special characters in text', () => {
      const specialText = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      updateInputText(1, specialText, mockSetInputs);

      const updater = mockSetInputs.mock.calls[0][0];
      const result = updater(mockInputs);

      expect(result[0].text).toBe(specialText);
    });

    it('should preserve all other properties when updating text', () => {
      updateInputText(1, 'updated text', mockSetInputs);

      const updater = mockSetInputs.mock.calls[0][0];
      const result = updater(mockInputs);

      expect(result[0].id).toBe(1);
      expect(result[0].encoding).toBe('ascii');
      expect(result[0].ignorePunctuation).toBe(false);
      expect(result[0].ignoreWhitespace).toBe(false);
      expect(result[0].ignoreCasing).toBe(false);
      expect(result[0].color).toBe(INPUT_COLORS[0]);
    });
  });

  describe('createNewInput', () => {
    it('should create input with correct ID and color', () => {
      const result = createNewInput(5, 3);

      expect(result.id).toBe(5);
      expect(result.color).toBe(INPUT_COLORS[3]);
    });

    it('should create input with default values', () => {
      const result = createNewInput(1, 0);

      expect(result).toEqual({
        id: 1,
        text: '',
        encoding: 'ascii',
        ignorePunctuation: false,
        ignoreWhitespace: false,
        ignoreCasing: false,
        color: INPUT_COLORS[0],
      });
    });

    it('should handle different color indices', () => {
      const result1 = createNewInput(1, 0);
      const result2 = createNewInput(2, 1);
      const result3 = createNewInput(3, 4);

      expect(result1.color).toBe(INPUT_COLORS[0]);
      expect(result2.color).toBe(INPUT_COLORS[1]);
      expect(result3.color).toBe(INPUT_COLORS[4]);
    });

    it('should handle edge case color indices', () => {
      const result = createNewInput(1, INPUT_COLORS.length - 1);

      expect(result.color).toBe(INPUT_COLORS[INPUT_COLORS.length - 1]);
    });
  });

  describe('canAddInput', () => {
    it('should return true when under limit', () => {
      expect(canAddInput([])).toBe(true);
      expect(canAddInput([mockInputs[0]])).toBe(true);
      expect(canAddInput(mockInputs)).toBe(true);
    });

    it('should return false when at limit', () => {
      const maxInputs = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        text: `test${i + 1}`,
        encoding: 'ascii' as const,
        ignorePunctuation: false,
        ignoreWhitespace: false,
        ignoreCasing: false,
        color: INPUT_COLORS[i],
      }));

      expect(canAddInput(maxInputs)).toBe(false);
    });

    it('should return false when over limit', () => {
      const overLimitInputs = Array.from({ length: 6 }, (_, i) => ({
        id: i + 1,
        text: `test${i + 1}`,
        encoding: 'ascii' as const,
        ignorePunctuation: false,
        ignoreWhitespace: false,
        ignoreCasing: false,
        color: INPUT_COLORS[i % INPUT_COLORS.length],
      }));

      expect(canAddInput(overLimitInputs)).toBe(false);
    });
  });

  describe('getNextInputId', () => {
    it('should return 1 for empty array', () => {
      expect(getNextInputId([])).toBe(1);
    });

    it('should return next ID after highest existing ID', () => {
      expect(getNextInputId([mockInputs[0]])).toBe(2);
      expect(getNextInputId(mockInputs)).toBe(3);
    });

    it('should handle non-sequential IDs', () => {
      const nonSequentialInputs = [
        { ...mockInputs[0], id: 1 },
        { ...mockInputs[1], id: 5 },
        { ...mockInputs[0], id: 10 },
      ];

      expect(getNextInputId(nonSequentialInputs)).toBe(4); // length + 1
    });

    it('should handle single input', () => {
      expect(getNextInputId([mockInputs[0]])).toBe(2);
    });
  });
});