import { genericizeText, getProcessedText } from './textUtils';
import { Ciphertext } from '@/types/ciphertext';

describe('genericizeText', () => {
  it('should return empty string for empty input', () => {
    expect(genericizeText('')).toBe('');
    expect(genericizeText('   ')).toBe('');
    expect(genericizeText('!@#$%')).toBe('');
  });

  it('should genericize simple text correctly', () => {
    expect(genericizeText('WOWZA')).toBe('ABACD');
    expect(genericizeText('hello')).toBe('ABCCD');
    expect(genericizeText('test')).toBe('ABCD');
  });

  it('should handle ties by first appearance', () => {
    expect(genericizeText('abcabc')).toBe('ABCABC');
    expect(genericizeText('cabcab')).toBe('ABCABC');
  });

  it('should preserve whitespace and punctuation when present', () => {
    expect(genericizeText('WOW ZA!')).toBe('ABC DE!');
    expect(genericizeText('hello, world!')).toBe('ABCDE, FGHIJ!');
    expect(genericizeText('test@example.com')).toBe('ABCD@EFGHIJ.KLM');
  });

  it('should preserve case when present', () => {
    expect(genericizeText('WOWza')).toBe('ABCde');
    expect(genericizeText('Hello World')).toBe('ABCDE FGHIJ');
  });

  it('should handle mixed case and punctuation', () => {
    expect(genericizeText('Hello, World!')).toBe('ABCDE, FGHIJ!');
    expect(genericizeText('Test@123')).toBe('ABCD@EFG');
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
    expect(genericizeText('mississippi')).toBe('ABCDDCDDCDD');
    expect(genericizeText('banana')).toBe('ABACAC');
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
    expect(getProcessedText(input)).toBe('Hello World');
  });

  it('should apply ignoreCasing', () => {
    const input = createInput({ ignoreCasing: true });
    expect(getProcessedText(input)).toBe('hello, world!');
  });

  it('should apply ignoreGenericization when enabled', () => {
    const input = createInput({
      ignoreGenericization: true,
      genericizedText: 'ABCCDEFGH'
    });
    expect(getProcessedText(input)).toBe('ABCCDEFGH');
  });

  it('should not apply ignoreGenericization when disabled', () => {
    const input = createInput({
      ignoreGenericization: false,
      genericizedText: 'ABCCDEFGH'
    });
    expect(getProcessedText(input)).toBe('Hello, World!');
  });

  it('should apply multiple filters in correct order', () => {
    const input = createInput({
      ignoreWhitespace: true,
      ignorePunctuation: true,
      ignoreCasing: true
    });
    expect(getProcessedText(input)).toBe('helloworld');
  });

  it('should apply genericization with other filters', () => {
    const input = createInput({
      ignoreGenericization: true,
      ignoreWhitespace: true,
      ignorePunctuation: true,
      genericizedText: 'ABCCDEFGH'
    });
    expect(getProcessedText(input)).toBe('ABCCDEFGH');
  });

  it('should apply filters in correct order (filters first, then genericization)', () => {
    const input = createInput({
      ignoreGenericization: true,
      ignoreWhitespace: true,
      ignorePunctuation: true,
      ignoreCasing: true,
      genericizedText: 'ABCDEFGH'
    });
    expect(getProcessedText(input)).toBe('ABCDEFGH');
  });
});