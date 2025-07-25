// Pure utility for n-gram generation
export function getNgrams(text: string, n: number, mode: 'sliding' | 'block'): string[] {
  if (text.length === 0) return [];
  const ngrams: string[] = [];

  // Handle edge cases
  if (n <= 0) return text.split(''); // Treat as single characters
  if (n === 1) return text.split('');

  // If n-gram size is larger than text length, return the entire text as one n-gram
  if (n > text.length) return [text];

  if (mode === 'sliding') {
    for (let i = 0; i <= text.length - n; i++) {
      ngrams.push(text.slice(i, i + n));
    }
  } else {
    // Block mode: create n-grams up to the last complete chunk, ignore the remainder
    for (let i = 0; i + n <= text.length; i += n) {
      ngrams.push(text.slice(i, i + n));
    }
  }
  return ngrams;
}