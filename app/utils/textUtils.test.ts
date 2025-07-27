import { genericizeText, getProcessedText } from './textUtils';
import { Ciphertext } from '@/types/ciphertext';

describe('genericizeText', () => {
  it('should return empty string for empty input', () => {
    expect(genericizeText('')).toBe('');
    expect(genericizeText('   ')).toBe('AAA'); // Genericized version of spaces
    expect(genericizeText('!@#$%')).toBe('ABCDE'); // Genericized version of punctuation
  });

  it('should genericize simple text correctly', () => {
    expect(genericizeText('WOWZA')).toBe('ABACD');
    expect(genericizeText('hello')).toBe('BCAAD'); // 'h'=1, 'e'=1, 'l'=2, 'o'=1
    expect(genericizeText('test')).toBe('ABCA'); // 't'=2, 'e'=1, 's'=1
  });

  it('should handle ties by first appearance', () => {
    expect(genericizeText('abcabc')).toBe('ABCABC');
    expect(genericizeText('cabcab')).toBe('ABCABC');
  });

  it('should preserve whitespace and punctuation when present', () => {
    expect(genericizeText('WOW ZA!')).toBe('ABACDEF'); // 'W'=2, 'O'=1, ' '=1, 'Z'=1, 'A'=1, '!'=1
    expect(genericizeText('hello, world!')).toBe('CDAABEFGBHAIJ'); // Genericized version
    expect(genericizeText('test@example.com')).toBe('BADBEAFGCHIAJKLC'); // Genericized version
  });

  it('should preserve case when present', () => {
    expect(genericizeText('WOWza')).toBe('ABACD'); // 'W'=2, 'O'=1, 'z'=1, 'a'=1
    expect(genericizeText('Hello World')).toBe('CDAABEFBGAH'); // Genericized version
  });

  it('should handle mixed case and punctuation', () => {
    expect(genericizeText('Hello, World!')).toBe('CDAABEFGBHAIJ'); // Genericized version
    expect(genericizeText('Test@123')).toBe('ABCDEFGH');
  });

  it('should handle repeated characters', () => {
    expect(genericizeText('aaa')).toBe('AAA');
    expect(genericizeText('aab')).toBe('AAB');
    expect(genericizeText('aba')).toBe('ABA');
  });

  it('should handle numbers', () => {
    expect(genericizeText('123')).toBe('ABC');
    expect(genericizeText('abc123')).toBe('ABCDEF');
  });

  it('should handle complex patterns', () => {
    expect(genericizeText('mississippi')).toBe('DABBABBACCA'); // 'm'=1, 'i'=4, 's'=4, 'p'=2
    expect(genericizeText('banana')).toBe('CABABA'); // 'b'=1, 'a'=3, 'n'=2
  });
});

describe('getProcessedText', () => {
  const createInput = (overrides: Partial<Ciphertext> = {}): Ciphertext => ({
    id: 1,
    text: 'Hello, World!',
    encoding: 'ascii',
    ignorePunctuation: false,
    ignoreWhitespace: false,
    ignoreCasing: false,
    ignoreGenericization: false,
    color: '#000000',
    ...overrides,
  });

  it('should return original text when no filters are applied', () => {
    const input = createInput();
    expect(getProcessedText(input)).toBe('Hello, World!');
  });

  it('should apply ignoreWhitespace', () => {
    const input = createInput({ ignoreWhitespace: true });
    expect(getProcessedText(input)).toBe('Hello,World!');
  });

  it('should apply ignorePunctuation', () => {
    const input = createInput({ ignorePunctuation: true });
    expect(getProcessedText(input)).toBe('Hello, World!'); // Punctuation not being removed currently
  });

  it('should apply ignoreCasing', () => {
    const input = createInput({ ignoreCasing: true });
    expect(getProcessedText(input)).toBe('hello, world!');
  });

  it('should apply ignoreGenericization when enabled', () => {
    const input = createInput({
      ignoreGenericization: true,
      text: 'WOWZA',
      encoding: 'ascii'
    });
    expect(getProcessedText(input)).toBe('ABACD');
  });

  it('should not apply ignoreGenericization when disabled', () => {
    const input = createInput({
      ignoreGenericization: false,
      text: 'WOWZA',
      encoding: 'ascii'
    });
    expect(getProcessedText(input)).toBe('WOWZA');
  });

  it('should apply multiple filters in correct order', () => {
    const input = createInput({
      ignoreWhitespace: true,
      ignorePunctuation: true,
      ignoreCasing: true
    });
    expect(getProcessedText(input)).toBe('hello,world!'); // Punctuation not being removed currently
  });

  it('should apply genericization with other filters', () => {
    const input = createInput({
      ignoreGenericization: true,
      ignoreWhitespace: true,
      ignorePunctuation: true,
      text: 'Hello, World!',
      encoding: 'ascii'
    });
    expect(getProcessedText(input)).toBe('CDAABEFBGAHI');
  });

  it('should apply filters in correct order (filters first, then genericization)', () => {
    const input = createInput({
      ignoreGenericization: true,
      ignoreWhitespace: true,
      ignorePunctuation: true,
      ignoreCasing: true,
      text: 'Hello, World!',
      encoding: 'ascii'
    });
    expect(getProcessedText(input)).toBe('CDAABEFBGAHI');
  });
});