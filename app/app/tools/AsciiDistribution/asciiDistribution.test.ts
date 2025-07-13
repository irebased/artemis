import { getAsciiDistribution } from './asciiDistribution';
import { Ciphertext } from '@/types/ciphertext';

describe('getAsciiDistribution', () => {
  const mockCiphertext: Ciphertext = {
    id: 1,
    text: 'Hello World',
    color: '#ff0000',
    encoding: 'ascii',
    ignorePunctuation: false,
    ignoreWhitespace: false,
    ignoreCasing: false
  };

  const mockCiphertextWithSpecialChars: Ciphertext = {
    id: 2,
    text: 'Hello\x00\x7F\xFF', // Contains null, DEL, and extended ASCII
    color: '#00ff00',
    encoding: 'ascii',
    ignorePunctuation: false,
    ignoreWhitespace: false,
    ignoreCasing: false
  };

  const mockCiphertextEmpty: Ciphertext = {
    id: 3,
    text: '',
    color: '#0000ff',
    encoding: 'ascii',
    ignorePunctuation: false,
    ignoreWhitespace: false,
    ignoreCasing: false
  };

  describe('with ascii range', () => {
    it('should return distributions with ASCII range (0-128)', () => {
      const inputs = [mockCiphertext];
      const result = getAsciiDistribution(inputs, 'ascii');

      expect(result.start).toBe(0);
      expect(result.end).toBe(128);
      expect(result.distributions).toHaveLength(1);
      expect(result.distributions[0].text).toBe('Hello World');
      expect(result.distributions[0].color).toBe('#ff0000');
      expect(result.distributions[0].encoding).toBe('ascii');
      expect(result.distributions[0].counts).toHaveLength(256);

      // Check that 'H' (ASCII 72) is counted
      expect(result.distributions[0].counts[72]).toBe(1);
      // Check that 'e' (ASCII 101) is counted
      expect(result.distributions[0].counts[101]).toBe(1);
      // Check that 'l' (ASCII 108) is counted three times (positions 3, 4, 10)
      expect(result.distributions[0].counts[108]).toBe(3);
    });

    it('should handle multiple inputs with ASCII range', () => {
      const inputs = [mockCiphertext, mockCiphertextWithSpecialChars];
      const result = getAsciiDistribution(inputs, 'ascii');

      expect(result.start).toBe(0);
      expect(result.end).toBe(128);
      expect(result.distributions).toHaveLength(2);
    });

    it('should handle empty input with ASCII range', () => {
      const inputs = [mockCiphertextEmpty];
      const result = getAsciiDistribution(inputs, 'ascii');

      expect(result.start).toBe(0);
      expect(result.end).toBe(128);
      expect(result.distributions).toHaveLength(1);
      expect(result.distributions[0].counts.every((count: number) => count === 0)).toBe(true);
    });
  });

  describe('with input range', () => {
    it('should calculate range based on used characters', () => {
      const inputs = [mockCiphertext];
      const result = getAsciiDistribution(inputs, 'input');

      // 'Hello World' uses characters from space (32) to 'r' (114)
      expect(result.start).toBe(32); // space character
      expect(result.end).toBe(115); // 'r' + 1
      expect(result.distributions).toHaveLength(1);
    });

    it('should handle multiple inputs with different character ranges', () => {
      const inputs = [mockCiphertext, mockCiphertextWithSpecialChars];
      const result = getAsciiDistribution(inputs, 'input');

      // Should include the full range from null (0) to extended ASCII (255)
      expect(result.start).toBe(0);
      expect(result.end).toBe(256);
    });

    it('should handle empty inputs with input range', () => {
      const inputs = [mockCiphertextEmpty];
      const result = getAsciiDistribution(inputs, 'input');

      // When no characters are used, should default to full range
      expect(result.start).toBe(0);
      expect(result.end).toBe(256);
    });

    it('should handle inputs with only extended ASCII characters', () => {
      const extendedAsciiInput: Ciphertext = {
        id: 4,
        text: '\x80\xFF', // Extended ASCII characters
        color: '#ffff00',
        encoding: 'ascii',
        ignorePunctuation: false,
        ignoreWhitespace: false,
        ignoreCasing: false
      };
      const inputs = [extendedAsciiInput];
      const result = getAsciiDistribution(inputs, 'input');

      expect(result.start).toBe(128); // \x80
      expect(result.end).toBe(256); // \xFF + 1
    });
  });

  describe('with default range (full)', () => {
    it('should return full ASCII range (0-256) for unknown range type', () => {
      const inputs = [mockCiphertext];
      const result = getAsciiDistribution(inputs, 'unknown');

      expect(result.start).toBe(0);
      expect(result.end).toBe(256);
      expect(result.distributions).toHaveLength(1);
    });

    it('should return full ASCII range for empty string range', () => {
      const inputs = [mockCiphertext];
      const result = getAsciiDistribution(inputs, '');

      expect(result.start).toBe(0);
      expect(result.end).toBe(256);
    });
  });

  describe('edge cases', () => {
    it('should handle empty inputs array', () => {
      const inputs: Ciphertext[] = [];
      const result = getAsciiDistribution(inputs, 'ascii');

      expect(result.start).toBe(0);
      expect(result.end).toBe(128);
      expect(result.distributions).toHaveLength(0);
    });

    it('should handle inputs with null bytes and control characters', () => {
      const controlCharInput: Ciphertext = {
        id: 5,
        text: '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A\x0B\x0C\x0D\x0E\x0F',
        color: '#ffffff',
        encoding: 'ascii',
        ignorePunctuation: false,
        ignoreWhitespace: false,
        ignoreCasing: false
      };
      const inputs = [controlCharInput];
      const result = getAsciiDistribution(inputs, 'input');

      expect(result.start).toBe(0);
      expect(result.end).toBe(16); // \x0F + 1
      expect(result.distributions[0].counts[0]).toBe(1); // \x00
      expect(result.distributions[0].counts[10]).toBe(1); // \x0A
    });

    it('should handle inputs with characters above 255 (should be ignored)', () => {
      const unicodeInput: Ciphertext = {
        id: 6,
        text: 'Hello\u{1F600}World', // Contains emoji
        color: '#ff00ff',
        encoding: 'ascii',
        ignorePunctuation: false,
        ignoreWhitespace: false,
        ignoreCasing: false
      };
      const inputs = [unicodeInput];
      const result = getAsciiDistribution(inputs, 'input');

      // Should only count ASCII characters, emoji should be ignored
      // The range should be from 'H' (72) to 'r' (114)
      expect(result.start).toBe(72); // 'H'
      expect(result.end).toBe(115); // 'r' + 1
      // 'H' should still be counted
      expect(result.distributions[0].counts[72]).toBe(1);
    });

    it('should handle different encodings', () => {
      const base64Input: Ciphertext = {
        id: 7,
        text: 'SGVsbG8gV29ybGQ=', // "Hello World" in base64
        color: '#00ffff',
        encoding: 'base64',
        ignorePunctuation: false,
        ignoreWhitespace: false,
        ignoreCasing: false
      };
      const inputs = [base64Input];
      const result = getAsciiDistribution(inputs, 'input');

      expect(result.distributions).toHaveLength(1);
      expect(result.distributions[0].encoding).toBe('base64');
      // Should have decoded the base64 and counted the actual characters
      expect(result.distributions[0].counts[72]).toBe(1); // 'H'
    });
  });

  describe('character counting accuracy', () => {
    it('should correctly count repeated characters', () => {
      const repeatedInput: Ciphertext = {
        id: 8,
        text: 'aaa',
        color: '#123456',
        encoding: 'ascii',
        ignorePunctuation: false,
        ignoreWhitespace: false,
        ignoreCasing: false
      };
      const inputs = [repeatedInput];
      const result = getAsciiDistribution(inputs, 'input');

      expect(result.distributions[0].counts[97]).toBe(3); // 'a' = ASCII 97
    });

    it('should correctly count mixed case characters', () => {
      const mixedCaseInput: Ciphertext = {
        id: 9,
        text: 'AaBbCc',
        color: '#654321',
        encoding: 'ascii',
        ignorePunctuation: false,
        ignoreWhitespace: false,
        ignoreCasing: false
      };
      const inputs = [mixedCaseInput];
      const result = getAsciiDistribution(inputs, 'input');

      expect(result.distributions[0].counts[65]).toBe(1); // 'A'
      expect(result.distributions[0].counts[97]).toBe(1); // 'a'
      expect(result.distributions[0].counts[66]).toBe(1); // 'B'
      expect(result.distributions[0].counts[98]).toBe(1); // 'b'
    });

    it('should correctly count special characters and punctuation', () => {
      const specialInput: Ciphertext = {
        id: 10,
        text: '!@#$%^&*()',
        color: '#abcdef',
        encoding: 'ascii',
        ignorePunctuation: false,
        ignoreWhitespace: false,
        ignoreCasing: false
      };
      const inputs = [specialInput];
      const result = getAsciiDistribution(inputs, 'input');

      expect(result.distributions[0].counts[33]).toBe(1); // '!'
      expect(result.distributions[0].counts[64]).toBe(1); // '@'
      expect(result.distributions[0].counts[35]).toBe(1); // '#'
    });
  });
});