import { useMemo } from 'react';
import { Ciphertext } from '@/types/ciphertext';

export function useFrequencyAnalysis(inputs: Ciphertext[]) {
  return useMemo(() => {
    const frequencies = inputs.map(input => {
      const text = input.text;
      const freq: Record<string, number> = {};
      const total = text.length;
      for (const char of text) {
        freq[char] = (freq[char] || 0) + 1;
      }
      const percentages: Record<string, number> = {};
      for (const [char, count] of Object.entries(freq)) {
        percentages[char] = (count / total) * 100;
      }
      return {
        text: input.text,
        color: input.color,
        frequencies: percentages
      };
    });
    const allChars = new Set<string>();
    frequencies.forEach(freq => {
      Object.keys(freq.frequencies).forEach(char => allChars.add(char));
    });
    const sortedChars = Array.from(allChars).sort();
    return { frequencies, sortedChars };
  }, [inputs]);
}