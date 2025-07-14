import { makeBase64UrlSafe, makeBase64UrlUnsafe } from './base64Utils';

describe('base64Utils', () => {
  describe('makeBase64UrlSafe', () => {
    it('should replace + with -', () => {
      const input = 'abc+def';
      const expected = 'abc-def';
      expect(makeBase64UrlSafe(input)).toBe(expected);
    });

    it('should replace / with _', () => {
      const input = 'abc/def';
      const expected = 'abc_def';
      expect(makeBase64UrlSafe(input)).toBe(expected);
    });

    it('should remove trailing = characters', () => {
      const input = 'abcdef===';
      const expected = 'abcdef';
      expect(makeBase64UrlSafe(input)).toBe(expected);
    });

    it('should handle multiple trailing = characters', () => {
      const input = 'abc==';
      const expected = 'abc';
      expect(makeBase64UrlSafe(input)).toBe(expected);
    });

    it('should handle all replacements together', () => {
      const input = 'abc+def/ghi===';
      const expected = 'abc-def_ghi';
      expect(makeBase64UrlSafe(input)).toBe(expected);
    });

    it('should handle empty string', () => {
      const input = '';
      const expected = '';
      expect(makeBase64UrlSafe(input)).toBe(expected);
    });

    it('should handle string with no special characters', () => {
      const input = 'abcdefgh';
      const expected = 'abcdefgh';
      expect(makeBase64UrlSafe(input)).toBe(expected);
    });

    it('should handle string with only + characters', () => {
      const input = '+++';
      const expected = '---';
      expect(makeBase64UrlSafe(input)).toBe(expected);
    });

    it('should handle string with only / characters', () => {
      const input = '///';
      const expected = '___';
      expect(makeBase64UrlSafe(input)).toBe(expected);
    });

    it('should handle string with only = characters', () => {
      const input = '===';
      const expected = '';
      expect(makeBase64UrlSafe(input)).toBe(expected);
    });

    it('should handle mixed case with special characters', () => {
      const input = 'ABC+DEF/GHI===';
      const expected = 'ABC-DEF_GHI';
      expect(makeBase64UrlSafe(input)).toBe(expected);
    });
  });

  describe('makeBase64UrlUnsafe', () => {
    it('should replace - with +', () => {
      const input = 'abc-def';
      const expected = 'abc+def=';
      expect(makeBase64UrlUnsafe(input)).toBe(expected);
    });

    it('should replace _ with /', () => {
      const input = 'abc_def';
      const expected = 'abc/def=';
      expect(makeBase64UrlUnsafe(input)).toBe(expected);
    });

    it('should add padding = characters to make length multiple of 4', () => {
      const input = 'abc';
      const expected = 'abc=';
      expect(makeBase64UrlUnsafe(input)).toBe(expected);
    });

    it('should add multiple padding = characters when needed', () => {
      const input = 'ab';
      const expected = 'ab==';
      expect(makeBase64UrlUnsafe(input)).toBe(expected);
    });

    it('should handle all replacements together', () => {
      const input = 'abc-def_ghi';
      const expected = 'abc+def/ghi=';
      expect(makeBase64UrlUnsafe(input)).toBe(expected);
    });

    it('should handle empty string', () => {
      const input = '';
      const expected = '';
      expect(makeBase64UrlUnsafe(input)).toBe(expected);
    });

    it('should handle string with no special characters', () => {
      const input = 'abcdefgh';
      const expected = 'abcdefgh';
      expect(makeBase64UrlUnsafe(input)).toBe(expected);
    });

    it('should handle string with only - characters', () => {
      const input = '---';
      const expected = '+++=';
      expect(makeBase64UrlUnsafe(input)).toBe(expected);
    });

    it('should handle string with only _ characters', () => {
      const input = '___';
      const expected = '///=';
      expect(makeBase64UrlUnsafe(input)).toBe(expected);
    });

    it('should handle string that already has correct length (multiple of 4)', () => {
      const input = 'abcd';
      const expected = 'abcd';
      expect(makeBase64UrlUnsafe(input)).toBe(expected);
    });

    it('should handle string with length 1 (adds 3 =)', () => {
      const input = 'a';
      const expected = 'a===';
      expect(makeBase64UrlUnsafe(input)).toBe(expected);
    });

    it('should handle string with length 2 (adds 2 =)', () => {
      const input = 'ab';
      const expected = 'ab==';
      expect(makeBase64UrlUnsafe(input)).toBe(expected);
    });

    it('should handle string with length 3 (adds 1 =)', () => {
      const input = 'abc';
      const expected = 'abc=';
      expect(makeBase64UrlUnsafe(input)).toBe(expected);
    });

    it('should handle mixed case with special characters', () => {
      const input = 'ABC-DEF_GHI';
      const expected = 'ABC+DEF/GHI=';
      expect(makeBase64UrlUnsafe(input)).toBe(expected);
    });
  });

  describe('round-trip conversion', () => {
    it('should be able to convert back and forth without data loss', () => {
      const original = 'abc+def/ghi=';
      const urlSafe = makeBase64UrlSafe(original);
      const restored = makeBase64UrlUnsafe(urlSafe);
      expect(restored).toBe(original);
    });

    it('should handle complex base64 strings', () => {
      const original = 'SGVsbG8gV29ybGQhISE=';
      const urlSafe = makeBase64UrlSafe(original);
      const restored = makeBase64UrlUnsafe(urlSafe);
      expect(restored).toBe(original);
    });

    it('should handle strings with mixed padding', () => {
      const original = 'abc=';
      const urlSafe = makeBase64UrlSafe(original);
      const restored = makeBase64UrlUnsafe(urlSafe);
      expect(restored).toBe(original);
    });
  });
});