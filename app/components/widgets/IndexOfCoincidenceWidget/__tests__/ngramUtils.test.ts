import { getNgrams } from '../ngramUtils';

describe('getNgrams', () => {
  it('returns single characters for n <= 0', () => {
    expect(getNgrams('Hello', 0, 'sliding')).toEqual(['H', 'e', 'l', 'l', 'o']);
    expect(getNgrams('Hello', -2, 'block')).toEqual(['H', 'e', 'l', 'l', 'o']);
  });

  it('returns single characters for n = 1', () => {
    expect(getNgrams('Hello', 1, 'sliding')).toEqual(['H', 'e', 'l', 'l', 'o']);
    expect(getNgrams('Hello', 1, 'block')).toEqual(['H', 'e', 'l', 'l', 'o']);
  });

  it('returns the whole string as one n-gram if n > text.length', () => {
    expect(getNgrams('Hello', 10, 'sliding')).toEqual(['Hello']);
    expect(getNgrams('Hello', 10, 'block')).toEqual(['Hello']);
  });

  it('returns correct n-grams for sliding mode', () => {
    expect(getNgrams('Hello', 2, 'sliding')).toEqual(['He', 'el', 'll', 'lo']);
    expect(getNgrams('Hello', 3, 'sliding')).toEqual(['Hel', 'ell', 'llo']);
    expect(getNgrams('Hello', 4, 'sliding')).toEqual(['Hell', 'ello']);
  });

  it('returns correct n-grams for block mode (divisible)', () => {
    expect(getNgrams('HelloWorld', 2, 'block')).toEqual(['He', 'll', 'oW', 'or', 'ld']);
    expect(getNgrams('abcdef', 3, 'block')).toEqual(['abc', 'def']);
  });

  it('returns correct n-grams for block mode (not divisible)', () => {
    expect(getNgrams('Hello', 2, 'block')).toEqual(['He', 'll']); // 'o' is ignored
    expect(getNgrams('abcdefg', 3, 'block')).toEqual(['abc', 'def']); // 'g' is ignored
  });

  it('returns empty array for empty string', () => {
    expect(getNgrams('', 2, 'sliding')).toEqual([]);
    expect(getNgrams('', 2, 'block')).toEqual([]);
  });
});