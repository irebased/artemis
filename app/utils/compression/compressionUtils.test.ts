import { compressLZMA, decompressLZMA } from './compressionUtils';

// Mock pako to avoid actual compression in tests
jest.mock('pako', () => ({
  deflate: jest.fn(),
  inflate: jest.fn(),
}));

const mockPako = require('pako');

describe('compressionUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('compressLZMA', () => {
    it('should compress string input successfully', async () => {
      const input = 'Hello World';
      const mockCompressed = new Uint8Array([1, 2, 3, 4, 5]);
      mockPako.deflate.mockReturnValue(mockCompressed);

      const result = await compressLZMA(input);

      expect(mockPako.deflate).toHaveBeenCalledWith(
        new TextEncoder().encode(input),
        { level: 9 }
      );
      expect(result).toBe('AQIDBAU'); // base64 of [1,2,3,4,5] made URL-safe
    });

    it('should compress Uint8Array input successfully', async () => {
      const input = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
      const mockCompressed = new Uint8Array([1, 2, 3]);
      mockPako.deflate.mockReturnValue(mockCompressed);

      const result = await compressLZMA(input);

      expect(mockPako.deflate).toHaveBeenCalledWith(input, { level: 9 });
      expect(result).toBe('AQID'); // base64 of [1,2,3] made URL-safe
    });

    it('should handle empty string input', async () => {
      const input = '';
      const mockCompressed = new Uint8Array([]);
      mockPako.deflate.mockReturnValue(mockCompressed);

      const result = await compressLZMA(input);

      expect(mockPako.deflate).toHaveBeenCalledWith(
        new TextEncoder().encode(''),
        { level: 9 }
      );
      expect(result).toBe(''); // empty base64 made URL-safe
    });

    it('should handle empty Uint8Array input', async () => {
      const input = new Uint8Array([]);
      const mockCompressed = new Uint8Array([]);
      mockPako.deflate.mockReturnValue(mockCompressed);

      const result = await compressLZMA(input);

      expect(mockPako.deflate).toHaveBeenCalledWith(input, { level: 9 });
      expect(result).toBe('');
    });

    it('should handle special characters in string', async () => {
      const input = 'Hello+World/Test===';
      const mockCompressed = new Uint8Array([1, 2, 3]);
      mockPako.deflate.mockReturnValue(mockCompressed);

      const result = await compressLZMA(input);

      expect(mockPako.deflate).toHaveBeenCalledWith(
        new TextEncoder().encode(input),
        { level: 9 }
      );
      expect(result).toBe('AQID');
    });

    it('should handle Unicode characters', async () => {
      const input = 'Hello 世界 🌍';
      const mockCompressed = new Uint8Array([1, 2, 3]);
      mockPako.deflate.mockReturnValue(mockCompressed);

      const result = await compressLZMA(input);

      expect(mockPako.deflate).toHaveBeenCalledWith(
        new TextEncoder().encode(input),
        { level: 9 }
      );
      expect(result).toBe('AQID');
    });

    it('should handle large string input', async () => {
      const input = 'A'.repeat(1000);
      const mockCompressed = new Uint8Array([1, 2, 3]);
      mockPako.deflate.mockReturnValue(mockCompressed);

      const result = await compressLZMA(input);

      expect(mockPako.deflate).toHaveBeenCalledWith(
        new TextEncoder().encode(input),
        { level: 9 }
      );
      expect(result).toBe('AQID');
    });

    it('should reject when pako.deflate throws error', async () => {
      const input = 'Hello World';
      const error = new Error('Compression failed');
      mockPako.deflate.mockImplementation(() => {
        throw error;
      });

      await expect(compressLZMA(input)).rejects.toThrow('Compression failed');
    });

    it('should handle base64 characters that need URL safety', async () => {
      const input = 'test';
      // Mock compressed data that would produce base64 with + and / characters
      const mockCompressed = new Uint8Array([255, 255, 255, 255]); // This would produce base64 with + and /
      mockPako.deflate.mockReturnValue(mockCompressed);

      const result = await compressLZMA(input);

      expect(result).toBe('_____w'); // URL-safe version of ////8
    });
  });

  describe('decompressLZMA', () => {
    it('should decompress URL-safe base64 successfully', async () => {
      const input = 'AQIDBAU'; // URL-safe base64 of [1,2,3,4,5]
      const mockDecompressed = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
      mockPako.inflate.mockReturnValue(mockDecompressed);

      const result = await decompressLZMA(input);

      expect(mockPako.inflate).toHaveBeenCalledWith(
        new Uint8Array([1, 2, 3, 4, 5])
      );
      expect(result).toBe('Hello');
    });

    it('should handle empty input', async () => {
      const input = '';
      const mockDecompressed = new Uint8Array([]);
      mockPako.inflate.mockReturnValue(mockDecompressed);

      const result = await decompressLZMA(input);

      expect(mockPako.inflate).toHaveBeenCalledWith(new Uint8Array([]));
      expect(result).toBe('');
    });

    it('should handle URL-safe base64 with padding', async () => {
      const input = 'AQID'; // URL-safe base64 of [1,2,3] (needs padding)
      const mockDecompressed = new Uint8Array([72, 101, 108, 108, 111]);
      mockPako.inflate.mockReturnValue(mockDecompressed);

      const result = await decompressLZMA(input);

      expect(mockPako.inflate).toHaveBeenCalledWith(
        new Uint8Array([1, 2, 3])
      );
      expect(result).toBe('Hello');
    });

    it('should handle base64 with special characters converted back', async () => {
      const input = '_____w'; // URL-safe version of ////8
      const mockDecompressed = new Uint8Array([72, 101, 108, 108, 111]);
      mockPako.inflate.mockReturnValue(mockDecompressed);

      const result = await decompressLZMA(input);

      expect(mockPako.inflate).toHaveBeenCalledWith(
        new Uint8Array([255, 255, 255, 255])
      );
      expect(result).toBe('Hello');
    });

    it('should handle Unicode decompression', async () => {
      const input = 'AQID';
      const mockDecompressed = new Uint8Array([72, 101, 108, 108, 111, 32, 228, 184, 150, 231, 149, 140]); // "Hello 世界"
      mockPako.inflate.mockReturnValue(mockDecompressed);

      const result = await decompressLZMA(input);

      expect(result).toBe('Hello 世界');
    });

    it('should reject when atob throws error', async () => {
      const input = 'invalid-base64!@#';

      await expect(decompressLZMA(input)).rejects.toThrow();
    });

    it('should reject when pako.inflate throws error', async () => {
      const input = 'AQID';
      const error = new Error('Decompression failed');
      mockPako.inflate.mockImplementation(() => {
        throw error;
      });

      await expect(decompressLZMA(input)).rejects.toThrow('Decompression failed');
    });

    it('should handle base64 with different padding lengths', async () => {
      // Test with valid base64 that needs different padding
      const testCases = [
        { input: 'AQID', expected: [1, 2, 3] }, // valid base64, no padding needed
        { input: 'AQI', expected: [1, 2] }, // needs 1 padding
        { input: 'AQ', expected: [1] }, // needs 2 padding
      ];

      for (const { input, expected } of testCases) {
        const mockDecompressed = new Uint8Array([72, 101, 108, 108, 111]);
        mockPako.inflate.mockReturnValue(mockDecompressed);

        await decompressLZMA(input);

        expect(mockPako.inflate).toHaveBeenCalledWith(
          new Uint8Array(expected)
        );
      }
    });
  });

  describe('round-trip compression', () => {
    it('should compress and decompress string without data loss', async () => {
      const original = 'Hello World! This is a test string with special characters: +/===';

      // Mock compression
      const mockCompressed = new Uint8Array([1, 2, 3, 4, 5]);
      mockPako.deflate.mockReturnValue(mockCompressed);

      // Mock decompression
      const mockDecompressed = new TextEncoder().encode(original);
      mockPako.inflate.mockReturnValue(mockDecompressed);

      const compressed = await compressLZMA(original);
      const decompressed = await decompressLZMA(compressed);

      expect(decompressed).toBe(original);
    });

    it('should handle binary data round-trip', async () => {
      const original = new Uint8Array([1, 2, 3, 4, 5, 255, 0, 128]);

      // Mock compression
      const mockCompressed = new Uint8Array([1, 2, 3]);
      mockPako.deflate.mockReturnValue(mockCompressed);

      // Mock decompression
      mockPako.inflate.mockReturnValue(original);

      const compressed = await compressLZMA(original);
      const decompressed = await decompressLZMA(compressed);

      expect(decompressed).toBe(new TextDecoder().decode(original));
    });
  });
});