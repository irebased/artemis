import { compressSettings, decompressSettings } from './settingsUtils';

// Mock pako to avoid actual compression in tests
jest.mock('pako', () => ({
  deflate: jest.fn(),
  inflate: jest.fn(),
}));

const mockPako = require('pako');

describe('settingsUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('compressSettings', () => {
    it('should compress simple object successfully', () => {
      const settings = { mode: 'raw', windowSize: 64 };
      const mockCompressed = new Uint8Array([1, 2, 3, 4, 5]);
      mockPako.deflate.mockReturnValue(mockCompressed);

      const result = compressSettings(settings);

      expect(mockPako.deflate).toHaveBeenCalledWith(
        JSON.stringify(settings),
        { level: 9 }
      );
      expect(result).toBe('AQIDBAU='); // base64 of [1,2,3,4,5] with padding
    });

    it('should compress complex nested object', () => {
      const settings = {
        mode: 'sliding',
        windowSize: 128,
        nested: {
          subSetting: true,
          array: [1, 2, 3],
          string: 'test'
        }
      };
      const mockCompressed = new Uint8Array([1, 2, 3]);
      mockPako.deflate.mockReturnValue(mockCompressed);

      const result = compressSettings(settings);

      expect(mockPako.deflate).toHaveBeenCalledWith(
        JSON.stringify(settings),
        { level: 9 }
      );
      expect(result).toBe('AQID');
    });

    it('should compress empty object', () => {
      const settings = {};
      const mockCompressed = new Uint8Array([]);
      mockPako.deflate.mockReturnValue(mockCompressed);

      const result = compressSettings(settings);

      expect(mockPako.deflate).toHaveBeenCalledWith('{}', { level: 9 });
      expect(result).toBe('');
    });

    it('should compress null value', () => {
      const settings = null;
      const mockCompressed = new Uint8Array([1, 2, 3]);
      mockPako.deflate.mockReturnValue(mockCompressed);

      const result = compressSettings(settings);

      expect(mockPako.deflate).toHaveBeenCalledWith('null', { level: 9 });
      expect(result).toBe('AQID');
    });

    it('should compress array', () => {
      const settings = [1, 2, 3, 'test', { nested: true }];
      const mockCompressed = new Uint8Array([1, 2, 3]);
      mockPako.deflate.mockReturnValue(mockCompressed);

      const result = compressSettings(settings);

      expect(mockPako.deflate).toHaveBeenCalledWith(
        JSON.stringify(settings),
        { level: 9 }
      );
      expect(result).toBe('AQID');
    });

    it('should compress string value', () => {
      const settings = 'simple string';
      const mockCompressed = new Uint8Array([1, 2, 3]);
      mockPako.deflate.mockReturnValue(mockCompressed);

      const result = compressSettings(settings);

      expect(mockPako.deflate).toHaveBeenCalledWith(
        JSON.stringify(settings),
        { level: 9 }
      );
      expect(result).toBe('AQID');
    });

    it('should compress number value', () => {
      const settings = 42;
      const mockCompressed = new Uint8Array([1, 2, 3]);
      mockPako.deflate.mockReturnValue(mockCompressed);

      const result = compressSettings(settings);

      expect(mockPako.deflate).toHaveBeenCalledWith('42', { level: 9 });
      expect(result).toBe('AQID');
    });

    it('should compress boolean value', () => {
      const settings = true;
      const mockCompressed = new Uint8Array([1, 2, 3]);
      mockPako.deflate.mockReturnValue(mockCompressed);

      const result = compressSettings(settings);

      expect(mockPako.deflate).toHaveBeenCalledWith('true', { level: 9 });
      expect(result).toBe('AQID');
    });

    it('should handle object with special characters', () => {
      const settings = {
        name: 'test+name/with=special',
        value: 'normal'
      };
      const mockCompressed = new Uint8Array([1, 2, 3]);
      mockPako.deflate.mockReturnValue(mockCompressed);

      const result = compressSettings(settings);

      expect(mockPako.deflate).toHaveBeenCalledWith(
        JSON.stringify(settings),
        { level: 9 }
      );
      expect(result).toBe('AQID');
    });

    it('should handle object with Unicode characters', () => {
      const settings = {
        name: '测试名称',
        value: 'normal'
      };
      const mockCompressed = new Uint8Array([1, 2, 3]);
      mockPako.deflate.mockReturnValue(mockCompressed);

      const result = compressSettings(settings);

      expect(mockPako.deflate).toHaveBeenCalledWith(
        JSON.stringify(settings),
        { level: 9 }
      );
      expect(result).toBe('AQID');
    });

    it('should throw error when pako.deflate fails', () => {
      const settings = { test: 'value' };
      const error = new Error('Compression failed');
      mockPako.deflate.mockImplementation(() => {
        throw error;
      });

      expect(() => compressSettings(settings)).toThrow('Compression failed');
    });
  });

  describe('decompressSettings', () => {
    it('should decompress simple object successfully', () => {
      const compressed = 'AQIDBAU'; // base64 of [1,2,3,4,5]
      const mockDecompressed = new Uint8Array([123, 34, 109, 111, 100, 101, 34, 58, 34, 114, 97, 119, 34, 125]); // '{"mode":"raw"}'
      mockPako.inflate.mockReturnValue(mockDecompressed);

      const result = decompressSettings(compressed);

      expect(mockPako.inflate).toHaveBeenCalledWith(
        new Uint8Array([1, 2, 3, 4, 5])
      );
      expect(result).toEqual({ mode: 'raw' });
    });

    it('should decompress complex nested object', () => {
      const compressed = 'AQID';
      const mockDecompressed = new Uint8Array([123, 34, 110, 101, 115, 116, 101, 100, 34, 58, 123, 34, 116, 101, 115, 116, 34, 58, 116, 114, 117, 101, 125, 125]); // '{"nested":{"test":true}}'
      mockPako.inflate.mockReturnValue(mockDecompressed);

      const result = decompressSettings(compressed);

      expect(result).toEqual({ nested: { test: true } });
    });

    it('should decompress empty object', () => {
      const compressed = '';
      const mockDecompressed = new Uint8Array([123, 125]); // '{}'
      mockPako.inflate.mockReturnValue(mockDecompressed);

      const result = decompressSettings(compressed);

      expect(mockPako.inflate).toHaveBeenCalledWith(new Uint8Array([]));
      expect(result).toEqual({});
    });

    it('should decompress null value', () => {
      const compressed = 'AQID';
      const mockDecompressed = new Uint8Array([110, 117, 108, 108]); // 'null'
      mockPako.inflate.mockReturnValue(mockDecompressed);

      const result = decompressSettings(compressed);

      expect(result).toBeNull();
    });

    it('should decompress array', () => {
      const compressed = 'AQID';
      const mockDecompressed = new Uint8Array([91, 49, 44, 50, 44, 51, 93]); // '[1,2,3]'
      mockPako.inflate.mockReturnValue(mockDecompressed);

      const result = decompressSettings(compressed);

      expect(result).toEqual([1, 2, 3]);
    });

    it('should decompress string value', () => {
      const compressed = 'AQID';
      const mockDecompressed = new Uint8Array([34, 116, 101, 115, 116, 34]); // '"test"'
      mockPako.inflate.mockReturnValue(mockDecompressed);

      const result = decompressSettings(compressed);

      expect(result).toBe('test');
    });

    it('should decompress number value', () => {
      const compressed = 'AQID';
      const mockDecompressed = new Uint8Array([52, 50]); // '42'
      mockPako.inflate.mockReturnValue(mockDecompressed);

      const result = decompressSettings(compressed);

      expect(result).toBe(42);
    });

    it('should decompress boolean value', () => {
      const compressed = 'AQID';
      const mockDecompressed = new Uint8Array([116, 114, 117, 101]); // 'true'
      mockPako.inflate.mockReturnValue(mockDecompressed);

      const result = decompressSettings(compressed);

      expect(result).toBe(true);
    });

    it('should handle object with special characters', () => {
      const compressed = 'AQID';
      const mockDecompressed = new Uint8Array([123, 34, 110, 97, 109, 101, 34, 58, 34, 116, 101, 115, 116, 43, 110, 97, 109, 101, 47, 119, 105, 116, 104, 61, 115, 112, 101, 99, 105, 97, 108, 34, 125]); // '{"name":"test+name/with=special"}'
      mockPako.inflate.mockReturnValue(mockDecompressed);

      const result = decompressSettings(compressed);

      expect(result).toEqual({ name: 'test+name/with=special' });
    });

    it('should handle object with Unicode characters', () => {
      const compressed = 'AQID';
      // Create the correct byte array for '{"name":"测试名称"}'
      const jsonString = '{"name":"测试名称"}';
      const mockDecompressed = new TextEncoder().encode(jsonString);
      mockPako.inflate.mockReturnValue(mockDecompressed);

      const result = decompressSettings(compressed);

      expect(result).toEqual({ name: '测试名称' });
    });

    it('should throw error when atob fails', () => {
      const compressed = 'invalid-base64!@#';

      expect(() => decompressSettings(compressed)).toThrow();
    });

    it('should throw error when pako.inflate fails', () => {
      const compressed = 'AQID';
      const error = new Error('Decompression failed');
      mockPako.inflate.mockImplementation(() => {
        throw error;
      });

      expect(() => decompressSettings(compressed)).toThrow('Decompression failed');
    });

    it('should throw error when JSON.parse fails', () => {
      const compressed = 'AQID';
      const mockDecompressed = new Uint8Array([105, 110, 118, 97, 108, 105, 100, 45, 106, 115, 111, 110]); // 'invalid-json'
      mockPako.inflate.mockReturnValue(mockDecompressed);

      expect(() => decompressSettings(compressed)).toThrow();
    });

    it('should handle base64 with padding', () => {
      const compressed = 'AQID'; // base64 of [1,2,3] (needs padding)
      const mockDecompressed = new Uint8Array([123, 34, 116, 101, 115, 116, 34, 58, 34, 118, 97, 108, 117, 101, 34, 125]); // '{"test":"value"}'
      mockPako.inflate.mockReturnValue(mockDecompressed);

      const result = decompressSettings(compressed);

      expect(mockPako.inflate).toHaveBeenCalledWith(
        new Uint8Array([1, 2, 3])
      );
      expect(result).toEqual({ test: 'value' });
    });
  });

  describe('round-trip compression', () => {
    it('should compress and decompress object without data loss', () => {
      const original = {
        mode: 'sliding',
        windowSize: 128,
        nested: {
          subSetting: true,
          array: [1, 2, 3],
          string: 'test'
        }
      };

      // Mock compression
      const mockCompressed = new Uint8Array([1, 2, 3, 4, 5]);
      mockPako.deflate.mockReturnValue(mockCompressed);

      // Mock decompression
      const mockDecompressed = new TextEncoder().encode(JSON.stringify(original));
      mockPako.inflate.mockReturnValue(mockDecompressed);

      const compressed = compressSettings(original);
      const decompressed = decompressSettings(compressed);

      expect(decompressed).toEqual(original);
    });

    it('should handle complex nested structures', () => {
      const original = {
        settings: {
          frequency: {
            ngramSize: 2,
            ngramMode: 'sliding'
          },
          entropy: {
            mode: 'raw',
            windowSize: 64
          }
        },
        metadata: {
          name: 'Test Dashboard',
          version: '1.0.0',
          tags: ['crypto', 'analysis']
        }
      };

      // Mock compression
      const mockCompressed = new Uint8Array([1, 2, 3]);
      mockPako.deflate.mockReturnValue(mockCompressed);

      // Mock decompression
      const mockDecompressed = new TextEncoder().encode(JSON.stringify(original));
      mockPako.inflate.mockReturnValue(mockDecompressed);

      const compressed = compressSettings(original);
      const decompressed = decompressSettings(compressed);

      expect(decompressed).toEqual(original);
    });
  });
});